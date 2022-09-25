const BLOCK_LIST = {
    

    'url': ['child_process', '__proto__', 'constructor', '[]', 'prototype', 'toString',
       '<','>','{{','}}', 'function','UNION','LIKE','CHAR','UPPER',
        'HEX','REPLACE','RANDOMBLOB','--$' ,'QUOTE_IDENT','INSTR2','SUBSTR',
        'QUARTER','SLEEP','DIFFERENCE','CODE','ASCII','TONUMBER','ALPHA','REPLACE',
        'CONVERT','SYSMASTER','@@USERNAME','@@SERVERNAME','INFORMATION_SCHEMA','CHR','MD5','AND',
  'WHERE ', 'HEX','GROUP BY','ORDER BY','OR.+?(?=[1-9])','--', 'WAITFOR', 'CONCAT', 'THEN','IF','ELSE',
  'HAVING','MODE','PG_SLEEP','BEGIN','RLIKE','LIKE','ELT','DUAL', 'AS','BOOLEAN','DBMS_PIPE','DBMS_LOCK','DECLARE','GTID_SUBSET',
  'MAKE_SET','EXTRACVALUE','UPDATEXML','JSON_KEYS','--.*[a-z]$','--.*[1-9]$', 'FROM', 'IIF',
    ], 'query': [
        "--", 'UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', "'", '"', '`', '#'
    ], 'body': []
}

const RES_BLOCK_LIST = ['SQL', 'UPDATE', 'INSERT', 'DELETE', 'DROP', 'TABLE', 'CREATE', 'SELECT',
'primitive','function', 'truncated','integer','string','object', 'SQLITE_ERROR', 'CAST'

]

const validateResponse = function (body) {
    for (let param of RES_BLOCK_LIST) { 
    let regex = new RegExp(`${param}`,"gmi")
        if (typeof body === 'string') {
            if (regex.test(body)) { 
              //  console.log(param, 'CAUGHT')
                body = 'REJECTED'
            }
        }
        else if (typeof body === 'object') {
            let bodyAsString = JSON.stringify(body)
            if (regex.test(bodyAsString)) {
                body = {
                    'error' : 'REJECTED'
                }
            }

        }

    }
return body

}


const requestMiddleware = (properties) => (req, res, next) => {
    const statusCode = properties.resStatusCode
    let _res;
    let urlDecoded;
    const oldSend = res.send
    res.send = function (data) {
        res.send = oldSend // set function back to avoid the 'double-send'
        let new_data = validateResponse(data)
        return res.send(new_data) // just call as normal with data
    }
    
    try { 
        urlDecoded = decodeURIComponent(unescape(req.url))
    }
    catch { 
        urlDecoded = decodeURI(req.url)
    }
    urlDecoded = urlDecoded.replace('(',' ').replace(')','').replace(';',' ').replace(',',' ')

    if (properties.statusCode == 301 || properties.statusCode == 302) {
        _res = res.redirect
    }
    else {
        _res = res.status(statusCode).send
    };


    for (let param of BLOCK_LIST.url) {
        // this is url santizer, It's always running
        let regex;
             regex = new RegExp(param, 'gmi')

   
        if (regex.test(urlDecoded)) {
           // console.log(param , 'match!')
            return _res(properties.resData)
        }
    }


    console.log('Time:', Date.now(),urlDecoded)

    next()
}
module.exports = {'requestMiddleware' : requestMiddleware}
