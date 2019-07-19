export class User {

  public username: string
  private password: string = ""
  public email: string

  constructor(username: string, email:string ,password: string, passwordHashed: boolean = false) {
    this.username = username

    if (!passwordHashed) {
      this.setPassword(password)
    } else this.password = password
  }

  static fromDb(username: string, value: any): User {

   return new User(username, value.email, value.password)
 }

 public setPassword(toSet: string): void {
   // Hash and set password
   this.password = toSet
 }

 public getPassword(): string {
   return this.password
 }

 public validatePassword(toValidate: String): boolean {
   return this.password === toValidate
 }

}

export class UserHandler {
  public db: any
  constructor(db: any) {
    this.db = db
  }

  public get(username: string, callback: (err: Error | null, result: User | null) => void) {
    const collection = this.db.collection('users')
    // Find some documents
    collection.findOne({username: username}, function(err: any, result: any) {
      if (err) return callback(err, result)
      if (result)
        callback(err, User.fromDb(username, result))
      else
        callback(err, null)
    })
  }
  public save(user: User, callback: (err: Error | null) => void) {
  const collection = this.db.collection('users')
  // Insert some document
  collection.insertOne(
    user,
    function(err: any, result: any) {
      if(err)
        return callback(err)
      console.log("User inserted into the collection")
      callback(err)
  });
}
public remove(username: string, callback: (err: Error | null, result: User | null) => void) {
  const collection = this.db.collection('users')
  // Find some documents
  collection.remove({username: username}, true, function(err: any, result: any) {
    if (err) return callback(err, result)
    if (result)
      callback(err,result)
    else
      callback(err, null)
  })
}
}
