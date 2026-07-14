import cv2
import glob
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRAMES_DIR = os.path.join(BASE_DIR, "Penn_Action", "frames")
OUT_DIR = os.path.join(BASE_DIR, "dashboard", "public")

vids = [
    ("1659", "demo_squat.mp4", "Sentadilla (Squat)"),
    ("1348", "demo_pushup.mp4", "Flexión (Pushup)"),
    ("0341", "demo_bench.mp4", "Press Banca (Bench Press)"),
    ("1559", "demo_situp.mp4", "Abdominal (Situp)")
]

for vid_id, name, desc in vids:
    frames = sorted(glob.glob(os.path.join(FRAMES_DIR, vid_id, "*.jpg")))
    if not frames:
        print(f"Skipping {vid_id}, frames not found")
        continue
    
    out_path = os.path.join(OUT_DIR, name)
    out = cv2.VideoWriter(out_path, cv2.VideoWriter_fourcc(*'mp4v'), 15, (640, 360))
    
    for _ in range(2):  # 2 loops
        for f in frames:
            img = cv2.imread(f)
            if img is not None:
                img_resized = cv2.resize(img, (640, 360))
                out.write(img_resized)
                
    out.release()
    size_kb = os.path.getsize(out_path) // 1024
    print(f"Created {name} ({desc}) - {size_kb} KB")
