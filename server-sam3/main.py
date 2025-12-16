import torch
import cv2
import os
import shutil
import uuid
import httpx
import warnings
import supervision as sv
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from sam3.model_builder import build_sam3_image_model
from sam3.model.sam3_image_processor import Sam3Processor
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sam3.model_builder import build_sam3_video_predictor
from sam3.visualization_utils import (
    prepare_masks_for_visualization,
    visualize_formatted_frame_output,
)
from io import BytesIO

load_dotenv()

warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    message="FigureCanvasAgg is non-interactive, and thus cannot be shown",
)
plt.rcParams["figure.max_open_warning"] = 0
plt.switch_backend("Agg")
plt.ioff()

checkpoint_path = "models/sam3.pt"
bpe_path = "models/bpe_simple_vocab_16e6.txt.gz"

device = "cuda" if torch.cuda.is_available() else "cpu"
model = build_sam3_image_model(
    checkpoint_path=checkpoint_path,
    bpe_path=bpe_path,
    device=device,
)
img_processor = Sam3Processor(model)


video_predictor = build_sam3_video_predictor(
    checkpoint_path=checkpoint_path,
    bpe_path=bpe_path,
    gpus_to_use=[torch.cuda.current_device()],
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/test")
async def test():
    color = sv.ColorPalette.from_hex(
        [
            "#ffff00",
            "#ff9b00",
            "#ff8080",
            "#ff66b2",
            "#ff66ff",
            "#b266ff",
            "#9999ff",
            "#3399ff",
            "#66ffff",
            "#33ff99",
            "#66ff66",
            "#99ff00",
        ]
    )

    def from_sam(sam_result):
        xyxy = sam_result["boxes"].to(torch.float32).cpu().numpy()
        confidence = sam_result["scores"].to(torch.float32).cpu().numpy()
        mask = sam_result["masks"].to(torch.bool)
        mask = mask.reshape(mask.shape[0], mask.shape[2], mask.shape[3]).cpu().numpy()
        return sv.Detections(xyxy=xyxy, confidence=confidence, mask=mask)

    def annotate(image, detections, label=None):
        mask_annotator = sv.MaskAnnotator(
            color=color, color_lookup=sv.ColorLookup.INDEX, opacity=0.5
        )
        box_annotator = sv.BoxAnnotator(
            color=color, color_lookup=sv.ColorLookup.INDEX, thickness=1
        )
        label_annotator = sv.LabelAnnotator(
            color=color,
            color_lookup=sv.ColorLookup.INDEX,
            text_scale=0.5,
        )
        annotated_image = image.copy()
        annotated_image = mask_annotator.annotate(annotated_image, detections)
        annotated_image = box_annotator.annotate(annotated_image, detections)
        if label:
            labels = [
                f"{label} {confidence:.2f}" for confidence in detections.confidence
            ]
            annotated_image = label_annotator.annotate(
                annotated_image, detections, labels
            )

        return annotated_image

    image = Image.open("public/test.jpg").convert("RGB")
    inference_state = img_processor.set_image(image)
    output = img_processor.set_text_prompt(state=inference_state, prompt="bottle cap")
    detections = from_sam(sam_result=output)
    detections = detections[detections.confidence > 0.5]
    annotated_image = annotate(image, detections, label="bottle cap")
    annotated_image.save("public/test_result.jpg")
    return {"message": "success"}


@app.post("/api/image")
async def image(file: UploadFile = File(), query: str = Form(...)):
    basepath = "public/uploads/images/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    ext = os.path.splitext(file.filename)[1]
    upimg = basepath + str(uuid.uuid4()) + ext
    with open(upimg, "wb") as f:
        shutil.copyfileobj(file.file, f)

    dify_base_api = os.getenv("DIFY_BASE_API")
    token = os.getenv("DIFY_TRANSLATE_TOKEN")
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
    text = res.json().get("answer")

    color = sv.ColorPalette.from_hex(
        [
            "#ffff00",
            "#ff9b00",
            "#ff8080",
            "#ff66b2",
            "#ff66ff",
            "#b266ff",
            "#9999ff",
            "#3399ff",
            "#66ffff",
            "#33ff99",
            "#66ff66",
            "#99ff00",
        ]
    )

    def from_sam(sam_result):
        xyxy = sam_result["boxes"].to(torch.float32).cpu().numpy()
        confidence = sam_result["scores"].to(torch.float32).cpu().numpy()
        mask = sam_result["masks"].to(torch.bool)
        mask = mask.reshape(mask.shape[0], mask.shape[2], mask.shape[3]).cpu().numpy()
        return sv.Detections(xyxy=xyxy, confidence=confidence, mask=mask)

    def annotate(image, detections, label=None):
        mask_annotator = sv.MaskAnnotator(
            color=color, color_lookup=sv.ColorLookup.INDEX, opacity=0.5
        )
        box_annotator = sv.BoxAnnotator(
            color=color, color_lookup=sv.ColorLookup.INDEX, thickness=1
        )
        label_annotator = sv.LabelAnnotator(
            color=color,
            color_lookup=sv.ColorLookup.INDEX,
            text_scale=0.5,
        )
        annotated_image = image.copy()
        annotated_image = mask_annotator.annotate(annotated_image, detections)
        annotated_image = box_annotator.annotate(annotated_image, detections)
        if label:
            labels = [
                f"{label} {confidence:.2f}" for confidence in detections.confidence
            ]
            annotated_image = label_annotator.annotate(
                annotated_image, detections, labels
            )

        return annotated_image

    image = Image.open(upimg).convert("RGB")
    inference_state = img_processor.set_image(image)
    output = img_processor.set_text_prompt(state=inference_state, prompt=text)
    detections = from_sam(sam_result=output)
    detections = detections[detections.confidence > 0.5]
    annotated_image = annotate(image, detections, label=text)

    basepath = "public/uploads/imgout/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    outimg = basepath + str(uuid.uuid4()) + ".png"
    url = outimg.replace("public/", "/")
    annotated_image.save(outimg)
    return {"success": True, "message": "图片分割成功", "data": url}


@app.post("/api/video")
async def video(file: UploadFile = File(), query: str = Form(...)):
    basepath = "public/uploads/videos/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    ext = os.path.splitext(file.filename)[1]
    upvid = basepath + str(uuid.uuid4()) + ext
    with open(upvid, "wb") as f:
        shutil.copyfileobj(file.file, f)

    dify_base_api = os.getenv("DIFY_BASE_API")
    token = os.getenv("DIFY_TRANSLATE_TOKEN")
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
    text = res.json().get("answer")

    video_path = upvid

    # 开始会话
    response = video_predictor.handle_request(
        request=dict(
            type="start_session",
            resource_path=video_path,
        )
    )
    session_id = response["session_id"]

    print(f"会话已创建: {session_id}")

    # 提取视频帧用于可视化
    def extract_video_frames(video_path):
        """提取视频帧用于可视化"""
        cap = cv2.VideoCapture(video_path)
        frames = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            # 转换 BGR 到 RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame_rgb)

        cap.release()
        return frames

    # 获取视频信息
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()

    print(f"视频信息: {width}x{height}, {fps} FPS, 总帧数: {total_frames}")

    # 提取视频帧
    video_frames_for_vis = extract_video_frames(video_path)
    print(f"提取了 {len(video_frames_for_vis)} 帧")

    # 逐帧处理：为每一帧添加提示并获取分割结果
    print("开始逐帧处理...")
    all_outputs = {}

    for frame_idx in range(total_frames):
        try:
            # 为每一帧添加文本提示
            response = video_predictor.handle_request(
                request=dict(
                    type="add_prompt",
                    session_id=session_id,
                    frame_index=frame_idx,
                    text=text,
                )
            )

            if "outputs" in response:
                all_outputs[frame_idx] = response["outputs"]
                print(f"成功处理帧 {frame_idx + 1}/{total_frames}")
            else:
                print(f"帧 {frame_idx} 没有输出结果")

        except Exception as e:
            print(f"处理帧 {frame_idx} 时出错: {e}")
            break

    print(f"成功处理了 {len(all_outputs)} 帧")

    basepath = "public/uploads/vidout/"
    if not os.path.exists(basepath):
        os.makedirs(basepath)
    outvid = basepath + str(uuid.uuid4()) + ".mp4"

    # 创建视频写入器
    output_video_path = outvid
    fourcc = cv2.VideoWriter_fourcc(*"H264")
    out_video = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

    print("开始生成可视化视频...")

    # 使用更稳定的方式生成视频帧
    def create_visualization_frame(frame_idx, video_frames, outputs, target_size):
        """创建可视化帧，避免libpng错误"""
        try:
            # 创建图形，不使用太大的DPI
            fig = plt.figure(
                figsize=(target_size[0] / 300, target_size[1] / 300), dpi=100
            )

            # 可视化分割结果
            visualize_formatted_frame_output(
                frame_idx,
                video_frames,
                outputs_list=[prepare_masks_for_visualization({frame_idx: outputs})],
                titles=["SAM 3 Tracking"],
            )

            plt.tight_layout(pad=0)
            plt.axis("off")

            # 保存到内存缓冲区
            buf = BytesIO()
            plt.savefig(
                buf,
                format="png",
                bbox_inches="tight",
                pad_inches=0,
                dpi=100,
                facecolor="black",
            )
            buf.seek(0)

            # 使用PIL读取图像
            img = Image.open(buf)
            img = img.convert("RGB")

            # 转换为numpy数组
            img_array = np.array(img)

            # 转换为BGR格式用于OpenCV
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

            plt.close(fig)
            buf.close()

            # 调整尺寸
            if img_bgr.shape[1] != target_size[0] or img_bgr.shape[0] != target_size[1]:
                img_bgr = cv2.resize(img_bgr, target_size)

            return img_bgr

        except Exception as e:
            print(f"创建可视化帧 {frame_idx} 时出错: {e}")
            # 返回黑色帧作为备用
            return np.zeros((target_size[1], target_size[0], 3), dtype=np.uint8)

    # 生成视频
    processed_count = 0
    for frame_idx in range(total_frames):
        if frame_idx in all_outputs:
            try:
                # 创建可视化帧
                vis_frame = create_visualization_frame(
                    frame_idx,
                    video_frames_for_vis,
                    all_outputs[frame_idx],
                    (width, height),
                )

                # 写入视频
                out_video.write(vis_frame)
                processed_count += 1
                print(f"视频生成进度: {frame_idx + 1}/{total_frames}")

            except Exception as e:
                print(f"生成帧 {frame_idx} 时出错: {e}")
                # 写入黑色帧作为备用
                black_frame = np.zeros((height, width, 3), dtype=np.uint8)
                out_video.write(black_frame)
        else:
            # 对于没有输出的帧，写入黑色帧
            black_frame = np.zeros((height, width, 3), dtype=np.uint8)
            out_video.write(black_frame)
            print(f"帧 {frame_idx} 无输出，写入黑色帧")

    # 释放视频写入器
    out_video.release()

    # 结束会话
    video_predictor.handle_request(
        request=dict(
            type="close_session",
            session_id=session_id,
        )
    )
    video_predictor.shutdown()

    print(f"视频生成完成，成功处理 {processed_count} 帧")
    print(f"分割视频已保存到: {output_video_path}")
    url = outvid.replace("public/", "/")
    return {"success": True, "message": "视频分割成功", "data": url}


app.mount("/", StaticFiles(directory="public"))

if __name__ == "__main__":
    import multiprocessing
    import uvicorn

    multiprocessing.freeze_support()
    uvicorn.run(app, host="0.0.0.0", port=7801)
