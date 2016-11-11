 #!/usr/bin/env python

from __future__ import division, print_function, unicode_literals
import os
import re
import sys
import json
import math
import time
import shutil
from subprocess import Popen, PIPE, TimeoutExpired

globalFinalMinErr = 100;
globalFinalMaxErr = 0;
globalMinibatchMinErr = 100;
globalMinibatchMaxErr = 0;


filterRegex = re.compile('Epoch\[.*Minibatch\[')

minibatchRegexSearchV1 = re.compile('Epoch\[\s*?(\d*?) of \s*?(\d*?)\]-Minibatch\[.*?-\s*?(\d*), (\d*\.\d*)\%.*TrainLossPerSample = (.*?);')
minibatchRegexSearchV2 = re.compile('Epoch\[\s*?(\d*?) of \s*?(\d*?)\]-Minibatch\[.*?-\s*?(\d*), (\d*\.\d*)\%.*?(?:= .*\%.*?)?= (.*?) \*.*?;')

minibatchInitialRegexSearchV1 = re.compile('Epoch\[\s*?(\d*?) of \s*?(\d*?)\]-Minibatch\[.*?-\s*?(\d*)\].*TrainLossPerSample =\s*(.*?);')
minibatchInitialRegexSearchV2 = re.compile('Epoch\[\s*?(\d*?) of \s*?(\d*?)\]-Minibatch\[.*?-\s*?(\d*)\].*?(?:= .*\%.*?)?= (.*?) \*.*?;')

minibatchPartialRegexSearchV1 = re.compile('Epoch\[\s*?(\d*?) of \s*?(\d*?)\]-Minibatch\[.*?-\s*?(\d*), (\d*\.\d*)\%')
minibatchPartialRegexSearchV2 = re.compile('Epoch\[\s*?(\d*?) of \s*?(\d*?)\]-Minibatch\[.*?-\s*?(\d*), (\d*\.\d*)\%')

finalEpochRegexSearchV1 = re.compile('Finished Epoch\[\s*?(\d*) of \s*(\d*)].*TrainLossPerSample = (.*?);')
finalEpochRegexSearchV2 = re.compile('Finished Epoch\[\s*?(\d*) of \s*(\d*)].*?(?:= .*\%.*?)?= (.*?) \*.*?;')

def computeActMBEpoch(theLine, isNewFormat):
    global globalMinibatchMinErr
    global globalMinibatchMaxErr

    if isNewFormat:
        isNan = (".err = -nan" in theLine) or (".err = nan" in theLine)
        minibatchRegexSearch = minibatchRegexSearchV2
        minibatchInitialRegexSearch = minibatchInitialRegexSearchV2
        minibatchPartialRegexSearch = minibatchPartialRegexSearchV2
    else:
        isNan = ("EvalErr[0]PerSample = -nan" in theLine) or ("EvalErr[0]PerSample = nan" in theLine)
        minibatchRegexSearch = minibatchRegexSearchV1
        minibatchInitialRegexSearch = minibatchInitialRegexSearchV1
        minibatchPartialRegexSearch = minibatchPartialRegexSearchV1

    if isNan:
        results = minibatchPartialRegexSearch.search(theLine)
    else:
        results = minibatchRegexSearch.search(theLine)

    if results == None:
        return None

    if (results != None):
        curEpoch = float(results.group(1)) - 1
        totEpoch = float(results.group(2))
        curMB = float(results.group(3))
        mbPercent = float(results.group(4))
        isSkip = False
    else:
        results = minibatchInitialRegexSearch.search(theLine)
        curEpoch = float(results.group(1)) - 1
        totEpoch = float(results.group(2))
        curMB = float(results.group(3))
        isSkip = True

    if isSkip:
        return { "actEpoch": 0, "totEpoch": 0, "error": 0, "isskip": True }

    if ("EvalErr[0]PerSample = -nan" in theLine):
        error = 0.0
    elif ("EvalErr[0]PerSample = nan" in theLine):
        error = 1.0
    else:
        error = float(results.group(5))

    actEpoch = (curEpoch + (mbPercent / 100.0))

    if (error < globalMinibatchMinErr):
        globalMinibatchMinErr = error

    if (error > globalMinibatchMaxErr):
        globalMinibatchMaxErr = error

    return { "actEpoch": actEpoch, "totEpoch": totEpoch, "error": error, "isskip": False }

def computeActFinalEpoch(theLine, isNewFormat):
    global globalFinalMinErr
    global globalFinalMaxErr
    filterCount = 0;

    results = filterRegex.search(theLine)
    if results != None:
        filterCount = filterCount + 1

    if isNewFormat:
        finalEpochRegexSearch = finalEpochRegexSearchV2
    else:
        finalEpochRegexSearch = finalEpochRegexSearchV1

    results = finalEpochRegexSearch.search(theLine)
    if results == None:
        return None

    curEpoch = float(results.group(1))
    totEpoch = float(results.group(2))
    error = float(results.group(3))

    if (error < globalFinalMinErr):
        globalFinalMinErr = error

    if (error > globalFinalMaxErr):
        globalFinalMaxErr = error

    actEpoch = curEpoch
    return { "actEpoch": actEpoch, "totEpoch": totEpoch, "error": error, "isskip": False, "filterCount": filterCount }

def getMinibatchErrors(minibatchTempfile, totPoints, progress, minibatchLastLine, epochOffset, numFilteredLines, skiplines, isNewFormat):
    actPoints = int(totPoints * round(100 * progress, 0))
    actPoints = actPoints / 100

    if (actPoints < 10):
        actPoints = 10

    if (numFilteredLines > actPoints):
        skiplines = numFilteredLines / actPoints

    cc = 0
    minibatchErrorList = []
    lastModLine = ""
    lastErr = 0
    with open(minibatchTempfile, "r") as f:
        for line in f:
            if ((cc % skiplines) == 0):
                lastModLine = line
                lastErr = parseLineAndAddToList(line, minibatchErrorList, computeActMBEpoch, epochOffset, isNewFormat)
            cc = cc + 1

    if (minibatchLastLine != lastModLine and minibatchLastLine != ""):
        parseLineAndAddToList(minibatchLastLine, minibatchErrorList, computeActMBEpoch, epochOffset, isNewFormat)

    return (minibatchErrorList, lastErr)

def parseLineAndAddToList(theLine, theList, lineInfoExtractor, epochOffset, isNewFormat):
    res = lineInfoExtractor(theLine, isNewFormat)
    if res == None:
        return 0

    if res["isskip"]:
        return 0

    if math.isnan(res["error"]):
        res["error"] = 0.0

    aa = [ float("{:.4f}".format(epochOffset + res["actEpoch"])), float("{:.7f}".format(res["error"])) ]
    theList.append(aa)

    return res["error"]

epochOffset = 0;
filterCount = 0;
finalEpochList = []
with open(sys.argv[1], "r") as f:
   for line in f:
      filterCount = filterCount + parseLineAndAddToList(line, finalEpochList, computeActFinalEpoch, epochOffset, True)

progress = 0.0
totPoints = 300
skiplines = 1
minibatchErrorList, lastErr = getMinibatchErrors(sys.argv[1], totPoints, 1.0, "", epochOffset, filterCount, skiplines, True)


print (json.dumps({ "gFMinErr": globalFinalMinErr,
                   "gFMaxErr": globalFinalMaxErr, "gMMinErr": globalMinibatchMinErr,
                   "gMMaxErr": globalMinibatchMaxErr, "finPts":  finalEpochList, "miniPts": minibatchErrorList}, separators=(',', ':')))
