const config = require('config');

let csmanager;

if (config.get('app.useCSAPI'))
    csmanager = require('../libs/csManagerAPI');
else
    csmanager = require('../libs/csManager');

exports.postUpload = async(req, res, next) => {
    
    let id = req.file.destination.split("/");
    let result = "";
    result = await csmanager.process(id[1], req.file.originalname,req.session.project,req.headers.startpath);
    res.json({ itemid: result });
};

exports.getUploadToken = async(req, res, next) => {    
    let result = await csmanager.getUploadToken(req.params.name,req.params.size,req.session.project);
    res.json(result);
};


exports.getDownloadToken = async(req, res, next) => {    
    let result = await csmanager.getDownloadToken(req.params.itemid,req.params.type,req.session.project);
    res.json(result);
};

exports.processFromToken = async(req, res, next) => {
  
    let startpath = req.headers.startpath;
    let result = await csmanager.processFromToken(req.params.itemid, req.session.project,startpath);
    res.sendStatus(200);
};

exports.getSCS = async(req, res, next) => {
    let result = await csmanager.getSCS(req.params.itemid,req.session.project);
    res.send(Buffer.from(result));
};

exports.getSTEP = async(req, res, next) => {
    let result = await csmanager.getSTEP(req.params.itemid,req.session.project);
    res.send(Buffer.from(result));
};


exports.getPNG = async(req, res, next) => {
    let result = await csmanager.getPNG(req.params.itemid,req.session.project);
    res.send(Buffer.from(result));
};

exports.getModels = async (req, res, next) => {
    let result = await csmanager.getModels(req.session.project);
    res.json(result);    
};

exports.deleteModel = async (req, res, next) => {
    csmanager.deleteModel(req.params.itemid,req.session.project);
    res.sendStatus(200);
};

exports.processWebhook = async (req, res, next) => {
    csmanager.updateConversionStatus(req.body.id,req.body.files);
    res.sendStatus(200);
};


exports.generateSTEP = async (req, res, next) => {
    csmanager.generateSTEP(req.params.itemid,req.session.project);
    res.sendStatus(200);
};


exports.getStreamingSession = async (req, res, next) => {
    let s = await csmanager.getStreamingSession();
    setTimeout(() => {
    req.session.streamingSessionId = s.sessionid.slice();
    req.session.save();
    console.log(req.session.id.toString(), req.session.streamingSessionId);
    }, 300);
    res.json(s);
};



exports.enableStreamAccess = async (req, res, next) => {
    let s = await csmanager.enableStreamAccess(req.params.itemid,req.session.project, req.session.streamingSessionId);
    console.log("Access:" + req.session.id.toString() + " "  + req.session.streamingSessionId);
    res.sendStatus(200);
};