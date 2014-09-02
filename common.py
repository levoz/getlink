# -*- coding: utf-8 -*-
# Copyright 2013 Gully Chen
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import uuid
from hmac import HMAC
from hashlib import sha256
from functools import wraps
from datetime import datetime
from urllib import unquote as _unquote
from qiniu import io, rs, fop, conf
from settings import QiniuConf

conf.ACCESS_KEY = QiniuConf.ACCESS_KEY
conf.SECRET_KEY = QiniuConf.SECRET_KEY

class ImageMime:
    GIF = "image/gif"
    JPEG = "image/jpeg"
    TIFF = "image/tiff"
    PNG = "image/png"
    BMP = "image/bmp"
    ICO = "image/x-icon"
    UNKNOWN = "application/octet-stream"

def get_img_type(binary):
    size = len(binary)
    if size >= 6 and binary.startswith("GIF"):
        return ImageMime.GIF, ".gif"
    elif size >= 8 and binary.startswith("\x89PNG\x0D\x0A\x1A\x0A"):
        return ImageMime.PNG, ".png"
    elif size >= 2 and binary.startswith("\xff\xD8"):
        return ImageMime.JPEG, ".jpg"
    elif (size >= 8 and (binary.startswith("II\x2a\x00") or
                             binary.startswith("MM\x00\x2a"))):
        return ImageMime.TIFF, ".tif"
    elif size >= 2 and binary.startswith("BM"):
        return ImageMime.BMP, ".bmp"
    elif size >= 4 and binary.startswith("\x00\x00\x01\x00"):
        return ImageMime.ICO, ".ico"
    else:
        return ImageMime.UNKNOWN, ""

def save_file_qiniu(binary, filename, mime="application/octet-stream"):
    policy = rs.PutPolicy(QiniuConf.BUCKET_NAME)
    uptoken = policy.token()
    extra = io.PutExtra()
    extra.mime_type = mime
    res, err = io.put(uptoken, filename, binary, extra)
    if err is not None:
        return 'none'
    url = rs.make_base_url(QiniuConf.BUCKET_DOMAIN, filename)
    return url

def save_photo(binary):
    mime, ext = get_img_type(binary)
    if mime == ImageMime.UNKNOWN:
        return 'none'
    rand_str = str(uuid.uuid1())
    filename = rand_str + ext
    url = save_file_qiniu(binary, filename, mime)
    return url