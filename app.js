const express = require("express")
const app = express();
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./webiidesenvolvimento-firebase-adminsdk-hk2hh-1316c85597.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();


app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", (req, res)=>{
    res.render("primeira_pagina")
})

app.post('/cadastrar', function (req, res) {
    var pessoas = db.collection('Pessoas').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Pessoa cadastrada com sucesso!')
        res.redirect('/')
    })
})

app.get("/consulta", async (req, res)=>{
const pessoas = await db.collection('Pessoas').get();
const data=[];
pessoas.forEach(doc=>{
    data.push({
        id:doc.id,
        nome: doc.get("nome"),
        telefone: doc.get("telefone"),
        origem: doc.get("origem"),
        data_contato: doc.get("data_contato"),
        observacao: doc.get("observacao")
        })
    })
res.render("consultar", {pessoas:data})
})

app.get("/editar/:id", async(req, res)=>{

const docRef = db.collection('Pessoas').doc(req.params.id);
const doc = await docRef.get()
if(!doc.exists){
    console.log("nao encontrado")
}else{
    console.log(doc.data())
    res.render("editar", {id: req.params.id, pessoa:doc.data()})
}

app.post('/atualizar',async(req,res)=>{
    try{
      const docId = req.body.id;
      const docRef = db.collection('Pessoas').doc(docId);
      await docRef.update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
      })
      res.redirect('/consulta')
    }catch{
      console.log("erro ao atualizar")
    }
  })
})

app.get("/excluir/:id", async(req,res)=>{
  const docId = req.params.id;
  const pessoas = await db.collection("Pessoas").doc(docId).delete();
  res.redirect("/consulta");
})

app.listen(7010, ()=>{
    console.log("Servidor ativo!")
})