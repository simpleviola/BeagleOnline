from django.http import HttpResponse

from time import time
def doAjax(request):
    print 'a'
    action = request.POST.get('param', BEAGLE_DEFAULT_ACTION)
    elt_text = request.POST.get('elt', '')
    # elt_text = json2elt(elt_text)
    tmp_path = '/tmp/' + str(int(time() * 1000 % 100000000)) + '.elt'
    f = open(tmp_path, 'w')
    f.write(elt_text)
    f.close()
    print 'b'
    ret = beagle(tmp_path, action)
    # ret = 'PASS' if ret.find('succeed') >= 0 else 'FAIL'
    return HttpResponse(ret)

import os
BEAGLE_PATH = r'/Users/wanqi/Desktop/BeagleTest/tools/beagle'
BEAGLE_DEFAULT_ACTION = r'-bmc -macro'
def beagle(file_path, action = BEAGLE_DEFAULT_ACTION, params_more = r'< /dev/null'):
    try:
        pf = os.popen(r'"%s" %s "%s" %s' % (BEAGLE_PATH, action, file_path, params_more))
        ret = pf.read()
        pf.close()
        return ret
    except Exception, e:
        return 'INNER ERROR'

import json
def json2elt(json_str):
    if not json_str:
        return ''
    obj = json.loads(json_str)
    ret = json.dumps(obj)
    return ret
