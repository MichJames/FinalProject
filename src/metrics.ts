export class Metric {
  timestamp: string;
  value: number;

  constructor(timestamp : string, value : number){
    this.timestamp = timestamp;
    this.value = value;
  }
}

export class MetricsHandler {

  private db: any

  constructor(db) {

    this.db = db
  }

  public save(metric: Metric, username: string, callback: (err: Error | null, result?: any) => void) {
      const collection = this.db.collection('users')
      // Insert some document
      collection.updateOne({username: username},{$push: {matric: metric}}, function(err: any, result: any) {
        if(err) return callback(err, result)
        console.log("Document inserted into the collection")
        callback(err, result)
      });
  }

  public remove( query: any, callback: (err: Error | null, result?: any) => void) {
      const collection = this.db.collection('documents')
      // Delete some document
      collection.deleteOne( query, function(err: any, result: any) {
        if(err) return callback(err, result)
        console.log("Document deleted into the collection")
        callback(err, result)
      });
  }

  public getA(username: string, callback: (err: Error | null, result?: any) => void) {
      const collection = this.db.collection('users')
      // Delete some document
      collection.find({username: username}).toArray(function(err: any, result: object) {
          if(err)
          return callback(err, result)
          console.log("Document gotten from the collection")
          callback(err, result)
      });
    }

  public getB(callback: (err: Error | null, result?: any) => void) {
      const collection = this.db.collection('documents')
      // Delete some document
      collection.find({}).toArray(function(err: any, res: object) {
        if(err) return callback(err, res);
        console.log("Document will get the collection");
        console.log(res);
        callback(err, res);
      });
  }

}
