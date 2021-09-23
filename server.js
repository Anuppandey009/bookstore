const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const connect = () => {
    return mongoose.connect("mongodb://127.0.0.1:27017/bookstore");
};


const authorSchema = new mongoose.Schema({
    first_name: {type: String, required: true },
    last_name: { type: String,required: true}
}, { versionKey: false, timestamps: true

})

const Author = mongoose.model("author", authorSchema);





const bookSchema = new mongoose.Schema({
    book_name: { type: String,require: true
    },
    authorIds: [
        {
            type: mongoose.Schema.Types.ObjectId,ref: "author",required: true
        }

    ],
    sectionId: {
        type: mongoose.Schema.Types.ObjectId, ref: "section", required: true
    },
    isChecked: {
        type: Boolean, require: true
    }
}, {
    versionKey: false
})

const Book = mongoose.model("books", bookSchema);










const sectionSchema = new mongoose.Schema({
    section_name: { type: String,require: true, unique: true}
}, {
    versionKey: false,timestamps: true
})


const Section = mongoose.model("section", sectionSchema);





// CRUD operations for authors schema

app.post("/authors", async function (req, res) {

    const postAuthor = await Author.create(req.body);
    return res.status(201).send(postAuthor);
})


app.get("/authors", async function (req, res) {

    const getAuthor = await Author.find().lean().exec();
    return res.status(200).send(getAuthor);


})





// CRUD operations for section schema

app.post("/section", async function (req, res) {

    const postSection = await Section.create(req.body);
    return res.status(201).send(postSection);


})

app.get("/section", async function (req, res) {

    const getSection = await Section.find().lean().exec();
    return res.status(200).send(getSection);

})



// CRUD operations for books schema

app.post("/books", async function (req, res) {

    const postBook = await Book.create(req.body);
    return res.status(201).send(postBook);

})

app.get("/books", async function (req, res) {

    const getBooks = await Book.find().populate("authorIds").populate("sectionId").lean().exec();
    return res.status(200).send(getBooks);


})




// get all books that are checked out

app.get("/checked", async function (req, res) {

    const checkedOut = await Book.find({ isChecked: true }).populate("authorIds").populate("sectionId").lean().exec();
    return res.status(200).send(checkedOut);

})

// get the detail of books that are not checked out

app.get("/section/:id/books", async function (req, res) {

    const notCheckoutSection = await Book.find({ $and: [{ "sectionId": req.params.id }, { "isChecked": "false" }] }).populate("sectionId").lean().exec();

    return res.status(200).send(notCheckoutSection);

})







// find books written by individual author

app.get("/authors/:id/books", async function (req, res) {

    const book = await Book.find({ authorIds: req.params.id }).lean().exec();
    const uniqueAuthor = await Author.findById(req.params.id).lean().exec();
    return res.status(200).send({ book, uniqueAuthor });

})

// finding books that are available in a section

app.get("/sections/:id/books", async function (req, res) {

    const book = await Book.find({ sectionId: req.params.id }).lean().exec();
    const sectionBook = await Section.findById(req.params.id).lean().exec();
    return res.status(200).send({ book, sectionBook });

})




// finding books written by the given author in a section 

app.get("/section/:id/author/:id/books", async function (req, res) {

    const sectionAuthorBook = await Book.find({ $and: [{ "sectionId": req.params.id }, { "authorIds": req.params.id }] }).populate("authorIds").lean().exec();
    return res.status(200).send(sectionAuthorBook);



})

app.listen(2345, async () => {
    await connect()
    console.log("I am running on port 2345");
})