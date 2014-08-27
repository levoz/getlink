from flask import Flask, g, request, render_template
from qiniu import io, rs, fop, conf
from settings import QiniuConf

app = Flask(__name__)
app.debug = True

conf.ACCESS_KEY = QiniuConf.ACCESS_KEY
conf.SECRET_KEY = QiniuConf.SECRET_KEY
BUCKET_NAME = QiniuConf.BUCKET_NAME
BUCKET_DOMAIN = QiniuConf.BUCKET_DOMAIN

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'): g.db.close()

@app.route('/')
def homepage():
    return render_template('index.html')

@app.route('/token', methods=['GET'])
def uptoken():
    policy = rs.PutPolicy(BUCKET_NAME)
    uptoken = policy.token()
    return '{"uptoken": "%s"}' % (uptoken)
