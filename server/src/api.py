from fastapi import APIRouter, Request, UploadFile, File
import asyncio
import cn2an
import uuid
import shutil
from starlette.responses import StreamingResponse
from .db import types, forms
import os
import httpx
from typing import List
from funasr import AutoModel
from openpyxl import Workbook
import uuid
import pypandoc
import re

router = APIRouter(prefix="/api")

model = AutoModel(
    disable_update=True,
    model="models/funasr/paraformer-zh",
    vad_model="models/funasr/fsmn-vad",
    punc_model="models/funasr/ct-punc",
    spk_model="models/funasr/cam++",
)


@router.post("/asr")
async def asr(file: UploadFile = File()):
    basepath = "public/uploads/asr/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    ext = os.path.splitext(file.filename)[1]
    filename = basepath + str(uuid.uuid4()) + ext
    with open(filename, "wb") as f:
        shutil.copyfileobj(file.file, f)
    res = await asyncio.to_thread(model.generate, filename)
    res[0]["text"] = cn2an.transform(res[0]["text"])
    res[0]["text"] = res[0]["text"].replace("幺", "1")
    for item in res[0]["sentence_info"]:
        item["text"] = cn2an.transform(item["text"])
        item["text"] = item["text"].replace("幺", "1")
    res[0]["url"] = filename.replace("public/", "/")
    return {"success": True, "message": "语音识别成功", "data": res}


@router.post("/doc")
async def doc(file: UploadFile = File()):
    dify_base_api = os.getenv("DIFY_BASE_API")

    basepath = "public/uploads/img/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    ext = os.path.splitext(file.filename)[1]
    filename = basepath + str(uuid.uuid4()) + ext
    with open(filename, "wb") as f:
        shutil.copyfileobj(file.file, f)

    token = os.getenv("DIFY_OCR_TOKEN")
    url = f"{dify_base_api}/files/upload"
    headers = {
        "Authorization": f"Bearer {token}",
    }
    data = {"user": "demo"}
    with open(filename, "rb") as f:
        async with httpx.AsyncClient(timeout=None) as client:
            res = await client.post(
                url,
                headers=headers,
                data=data,
                files={"file": (os.path.basename(file.filename), f)},
            )
            id = res.json().get("id")

    url = f"{dify_base_api}/chat-messages"
    data = {
        "user": "demo",
        "inputs": {},
        "query": "请识别并总结并以markdown格式输出，只输出makdown。",
        "response_mode": "blocking",
        "files": [
            {
                "type": "image",
                "transfer_method": "local_file",
                "upload_file_id": id,
            }
        ],
    }
    async with httpx.AsyncClient(timeout=None) as client:
        res = await client.post(url, json=data, headers=headers)
    md = res.json().get("answer")
    md = re.sub(r"^```(?:markdown)?\n|\n```$", "", md, flags=re.I)
    basepath = "public/uploads/doc/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    filename = basepath + str(uuid.uuid4()) + ".docx"
    pypandoc.convert_text(md, "docx", format="md", outputfile=filename)
    path = filename.replace("public/", "/")
    return {"success": True, "message": "获取响应成功", "data": path}


@router.post("/types/all")
async def get_types(request: Request):
    body = await request.json()
    type = body.get("type")
    data = types.find(type=type)
    return {"success": True, "message": "获取全部知识库类型成功", "data": list(data)}


@router.post("/types/get")
async def get_type(request: Request):
    body = await request.json()
    id = body.get("id")
    data = types.find_one(id=id)
    return {"success": True, "message": "获取知识库类型成功", "data": data}


@router.post("/types/add")
async def add_type(request: Request):
    body = await request.json()
    types.insert(body)
    return {"success": True, "message": "添加知识库类型成功"}


@router.post("/types/update")
async def update_type(request: Request):
    body = await request.json()
    types.update(body, ["id"])
    return {"success": True, "message": "更新知识库类型成功"}


@router.post("/types/delete")
async def delete_type(request: Request):
    body = await request.json()
    id = body.get("id")
    types.delete(id=id)
    return {"success": True, "message": "删除知识库类型成功"}


@router.post("/upload")
async def upimg(files: List[UploadFile] = File([])):
    upfiles = []
    basepath = "public/uploads/files/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    for file in files:
        filename = basepath + file.filename
        with open(filename, "wb") as f:
            shutil.copyfileobj(file.file, f)
            upfiles.append(filename)
    return {"success": True, "message": "上传文件成功", "data": upfiles}


@router.post("/form")
async def form_items(request: Request):
    body = await request.json()
    typeid = body.get("typeid", 0)
    data = forms.find(typeid=typeid)
    return {"success": True, "message": "获取表单项成功", "data": list(data)}


@router.post("/form/save")
async def handleAddFormItem(request: Request):
    body = await request.json()
    typeid = body.get("typeid", 0)
    items = body.get("items", [])
    forms.delete(typeid=typeid)
    for item in items:
        item["typeid"] = typeid
        forms.insert(item)
    return {"success": True, "message": "添加表单项成功"}


@router.post("/chat")
async def chat(request: Request):
    body = await request.json()
    query = body.get("query")
    upfiles = body.get("upfiles", [])
    files = []
    token = body.get("token")

    dify_base_api = os.getenv("DIFY_BASE_API")

    if not token:
        type = body.get("type")
        if type == "doc":
            token = os.getenv("DIFY_DOC_TOKEN")
        if type == "ocr":
            token = os.getenv("DIFY_OCR_TOKEN")
            url = f"{dify_base_api}/files/upload"
            headers = {
                "Authorization": f"Bearer {token}",
            }
            data = {"user": "demo"}
            for path in upfiles:
                with open(path, "rb") as f:
                    async with httpx.AsyncClient(timeout=None) as client:
                        res = await client.post(
                            url,
                            headers=headers,
                            data=data,
                            files={"file": (os.path.basename(path), f)},
                        )
                        id = res.json().get("id")
                        files.append(
                            {
                                "type": "image",
                                "transfer_method": "local_file",
                                "upload_file_id": id,
                            }
                        )
        if type == "docs":
            token = os.getenv("DIFY_DOCS_TOKEN")
            url = f"{dify_base_api}/files/upload"
            headers = {
                "Authorization": f"Bearer {token}",
            }
            data = {"user": "demo"}
            for path in upfiles:
                with open(path, "rb") as f:
                    async with httpx.AsyncClient(timeout=None) as client:
                        res = await client.post(
                            url,
                            headers=headers,
                            data=data,
                            files={"file": (os.path.basename(path), f)},
                        )
                        id = res.json().get("id")
                        files.append(
                            {
                                "type": "document",
                                "transfer_method": "local_file",
                                "upload_file_id": id,
                            }
                        )
        if type == "speech":
            token = os.getenv("DIFY_SPEECH_TOKEN")

    headers = {
        "Authorization": f"Bearer {token}",
    }
    url = f"{dify_base_api}/chat-messages"
    data = {
        "user": "demo",
        "inputs": {},
        "query": query,
        "response_mode": "streaming",
        "files": files,
    }

    async def stream():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", url, json=data, headers=headers) as res:
                async for chunk in res.aiter_bytes():
                    yield chunk

    return StreamingResponse(stream(), media_type="text/event-stream")


@router.post("/chat2")
async def json(request: Request):
    body = await request.json()
    query = body.get("query")
    dify_base_api = os.getenv("DIFY_BASE_API")
    token = os.getenv("DIFY_FORM_TOKEN")
    url = f"{dify_base_api}/chat-messages"
    headers = {
        "Authorization": f"Bearer {token}",
    }
    data = {
        "user": "demo",
        "inputs": {},
        "query": query,
        "response_mode": "blocking",
    }
    async with httpx.AsyncClient(timeout=None) as client:
        res = await client.post(url, json=data, headers=headers)
    data = res.json().get("answer")
    return {"success": True, "message": "获取响应成功", "data": data}


@router.post("/export")
async def export_data(request: Request):
    body = await request.json()
    items = body.get("items", [])

    rows = []
    for item in items:
        rows.append([item.get("name", ""), item.get("value", "")])

    wb = Workbook()
    ws = wb.active
    for r in rows:
        ws.append(r)

    path = "public/uploads/exports"
    os.makedirs(path, exist_ok=True)
    filename = f"{path}/{uuid.uuid4()}.xlsx"
    wb.save(filename)
    url = filename.replace("public/", "/")
    return {"success": True, "message": "导出数据成功", "data": url}
