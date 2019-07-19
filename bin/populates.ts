import { Metric, MetricsHandler } from '../src/metrics'

import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient
MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, (err: any, client: any) => {
  if(err) throw err
  const db = client.db('mydb')
  metrics.map(metric => {
    new MetricsHandler(db).save(metric, (err: any, result: any) => {
      if (err) console.log(err)
    })
  })
  client.close()
});
