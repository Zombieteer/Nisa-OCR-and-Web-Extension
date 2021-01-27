// const pgp = require("pg-promise")();
// const connectionString =
//   "postgresql://postgres:password@localhost:5432/doclockdb";

// const db = pgp(connectionString);

// module.exports = db;

const { Client } = require('pg')

let credentails = {
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    port: '5432',
    database: 'doclockdb'
}

const isObject = (value) => {
    return typeof value === 'object' && value !== null
}

const utility = {
    connect: function(app){
        const client = new Client(credentails)
        client.connect()
        .then(() => console.log('Connected to db'))
        .catch(e => console.log('\nSomething went wrong while connecting to db.\n',e))
        .finally(() => {
            client.end()
            app.listen(3002, () => console.log('Listening on port 3002'))
        })
    },
    executeQuery: async (qry,bind) => {
        if(typeof qry !== 'string') throw Error('Qry should be of type string.')
        if(bind && !Array.isArray(bind)) throw Error('Bind should be an Array.')

        const client = new Client(credentails)
        await client.connect()
        const result = await client.query(qry,bind)
        await client.end()
        return result
    },
    insert: async (Obj,tablename) => {
        if(typeof tablename !== 'string') throw Error('Tablename should be of type string.')
        if(!isObject(Obj)) throw Error('Insert argument must be an object')

        let values = Object.keys(Obj)
        if(values.length == 0) throw Error('Empty obj provided for insert.')
        let bind = []
        let qry_1 = `INSERT INTO ${tablename}(`
        let qry_2 = ') VALUES('
        for(let i = 0; i<values.length; i++){
            if(i == values.length-1){
                qry_1 += values[i]
                qry_2 += `$${i+1})` 
            }
            else {
                qry_1 += values[i] + ','
                qry_2 += `$${i+1},`
            }
            bind.push(Obj[values[i]])
        }
        
        let result = await utility.executeQuery(qry_1 + qry_2, bind)
        return result
    },
    update: async (Obj,tablename,filter) => {
        if(!isObject(Obj) || !isObject(filter)) throw Error('Update arg and filter must be an object')
        if(typeof tablename !== 'string') throw Error('Tablename should be of type string.')
        let values = Object.keys(Obj), bind = [], filterValues = Object.keys(filter)
        if(values.length == 0 || filterValues.length == 0) throw Error('Obj & Filter must not be empty objects.')

        let qry_1 = `UPDATE ${tablename} SET `
        let qry_2 = `WHERE `
        for(let i = 0; i<values.length; i++){
            if(i == values.length-1){
                qry_1 += `${values[i]}=$${i+1} `
            }
            else {
                qry_1 += `${values[i]}=$${i+1}, `
            }
            bind[i]=Obj[values[i]]
        }
        for(let i = 0; i<filterValues.length; i++){
            if(filterValues[i]){
                qry_2 += `${filterValues[i]}=$${values.length+i+1} `
                if(i != filterValues.length-1) qry_2 += 'AND '
                bind[values.length+i]=filter[filterValues[i]]
            }
        }
        let result = await utility.executeQuery(qry_1+qry_2, bind)
        return result
    }
}

module.exports = utility