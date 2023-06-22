const mongoose  = require("mongoose");
const uri = "mongodb+srv://HarryLLH:llh20030509@harry.l13xnlp.mongodb.net/?retryWrites=true&w=majority";
function run() {
// Connect the client to the server	(optional starting in v4.7)
console.log("running connect");
mongoose.connect(uri).then((conn) => {
    // await client.connect();
console.log("PRINT CONN");
console.log(conn);
conn.getClient().then((c)=>{console.log(c)})
dbClient.current = client;
})
}
// Send a ping to confirm a successful connection
// await client.db("admin").command({ ping: 1 });
// dbUser.current = client.db("Trial");
// await client.db("Trial").runcommand({insert: "Harry's first trial"});
// console.log("Pinged your deployment. You successfully connected to MongoDB!");
// };

run()