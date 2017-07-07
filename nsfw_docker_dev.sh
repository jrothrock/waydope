#!/bin/bash
boot2docker up



docker run --volume=/Users/username/Desktop/waydope:/workspace  bvlc/caffe:cpu \
python ./open_nsfw/classify_nsfw.py \
--model_def ./open_nsfw/nsfw_model/deploy.prototxt \
--pretrained_model ./open_nsfw/nsfw_model/resnet_50_1by2_nsfw.caffemodel \
$1
