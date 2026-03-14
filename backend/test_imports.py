import whisper
from moviepy import VideoFileClip
from pydub import AudioSegment
import imageio_ffmpeg as ffmpeg
import sklearn
import numpy

print("Whisper version:", whisper.__version__)
print("MoviePy version:", VideoFileClip.__name__)
print("FFmpeg exe:", ffmpeg.get_ffmpeg_exe())
print("Sklearn version:", sklearn.__version__)

try:
    AudioSegment.converter = ffmpeg.get_ffmpeg_exe()
    print("Pydub converter set.")
except Exception as e:
    print("Pydub error:", e)

print("All imports tested successfully.")
