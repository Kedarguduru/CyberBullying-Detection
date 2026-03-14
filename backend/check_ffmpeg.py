from moviepy import VideoFileClip
import os
import imageio_ffmpeg as ffmpeg

# Test if moviepy can find ffmpeg
executable = ffmpeg.get_ffmpeg_exe()
os.environ["IMAGEIO_FFMPEG_EXE"] = executable

print("Using FFmpeg exe:", executable)

# We check if moviepy's internal ffmpeg reader works by checking its existence
try:
    from moviepy.video.io.ffmpeg_reader import FFMPEG_VideoReader
    print("FFMPEG_VideoReader import ok")
except Exception as e:
    print("FFMPEG_VideoReader error:", e)

print("Check finished.")
