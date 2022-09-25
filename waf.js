const BLOCK_LIST = {
    'url': ['child_process', '__proto__', 'constructor', '[]', 'prototype', 'toString',
        '../','<','>','{{','}}', 'function','UNION','LIKE','CHAR','UPPER',
        'HEX','REPLACE','RANDOMBLOB','--' ,'QUOTE_IDENT','INSTR2','SUBSTR',
        'QUARTER','SLEEP','DIFFERENCE','CODE','ASCII','TONUMBER','ALPHA','REPLACE',
        'CONVERT','SYSMASTER','@@USERNAME','@@SERVERNAME','INFORMATION_SCHEMA','CHR','MD5','AND',
  'WHERE ', 'HEX','GROUP BY','ORDER BY','OR.+?(?=[1-9])'
    ], 'query': [
        "--", 'UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', "'", '"', '`', '#'
    ], 'body': []
}

const RES_BLOCK_LIST = ['SQL', 'UPDATE', 'INSERT', 'DELETE', 'DROP', 'TABLE', 'CREATE', 'SELECT',
'primitive','function', 'truncated','integer','string','object', 'SQLITE_ERROR',

]

const validateResponse = function (body) {

    if (typeof body === 'string') {
        body = body.toLowerCase()
    for (let param of RES_BLOCK_LIST) {
        if (body.match(param.toLowerCase())) {
            console.log('here!', param)
            body = 'REJECTED'
        }


    }
    return body
}
    else { 
        for (let i=0; i>body.length; i++) { 
            for (let _param of RES_BLOCK_LIST) {
                if (body[i].toLowerCase().includes(_param.toLowerCase())) { 
                    body[i] = "REJECTED"
                }
        }
    }

}
return body

}
const responseMiddleware = (req, res, next) => {
    const oldSend = res.send
    res.send = function (data) {
        res.send = oldSend // set function back to avoid the 'double-send'
        let new_data = validateResponse(data)
        return res.send(new_data) // just call as normal with data
    }
    return next()

};

const requestMiddleware = (properties) => (req, res, next) => {
    const statusCode = properties.resStatusCode
    let _res;
    if (properties.statusCode == 301 || properties.statusCode == 302) {
        _res = res.redirect
    }
    else {
        _res = res.status(statusCode).send
    };


    for (let param of BLOCK_LIST.url) {
        // this is url santizer, It's always running
        let regex = new RegExp(`\\s${param}\\s`,"gmi")
        if (regex.test(        decodeURI(            req.url))) {
            console.log(param , 'match!')
            return _res(properties.resData)
        }
    }
    if (req.query) {
        for (let i = 0; i < req.query.length; i++) {
            // this is query santizer, It's running only if you have any query parameters
            for (let param of BLOCK_LIST.query) {
                if (req.query[i].toLowerCase().includes(param.toLowerCase())) {
                    return _res(properties.resData)
                }
            }
        }
    }



    console.log('Time:', Date.now())
    next()
}
module.exports = {'requestMiddleware' : requestMiddleware, 'responseMiddleware' : responseMiddleware}