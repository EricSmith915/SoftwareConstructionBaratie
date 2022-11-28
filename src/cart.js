import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

import {
    getFirestore,
    collection,
    getDocs,
    setDoc,
    updateDoc,
    onSnapshot,
    doc,
    getDoc,
    connectFirestoreEmulator,
    deleteDoc,
    addDoc,
} from 'firebase/firestore'

import {
    createUserWithEmailAndPassword,
    getAuth, 
    onAuthStateChanged
} from 'firebase/auth';


//import { firebaseConfig } from "./firebaseConfig.js";

const firebaseConfig = {
    apiKey: "AIzaSyBZiOp9t_Orzgm8PQlZB5QNzF9mt_CXkY4",
    authDomain: "softwareconstructionbaratie.firebaseapp.com",
    projectId: "softwareconstructionbaratie",
    storageBucket: "softwareconstructionbaratie.appspot.com",
    messagingSenderId: "298658687745",
    appId: "1:298658687745:web:b087cae08882b11f50c900",
    measurementId: "G-748VR9HX3T"
  };

//init firebase app
initializeApp(firebaseConfig);




// init services
const db = getFirestore();
const auth = getAuth();


onAuthStateChanged(auth, (user) => {
  if (user !== null) {
      console.log("Current userID (uid):", user.uid);
      console.log("Welcome", user.email)
      const colRef = collection(db, 'Users');
      const usr = doc(db,"Users/"+user.uid)

      function checkCard(usrCart) {
        let cartbool = false
        onSnapshot(usr, (doc) => {
          cartbool = doc.data().Creditcard;
          usrCart(cartbool)
        })
      }
      


      //const userDocRef = doc(db,"Users/"+user.uid)
      const userCartcolref = collection(db,"Users/"+user.uid+"/CartItems");
      //This function allows us to extract/callback an array of food items to any part of our code.
      function cartArray(callBack) {
        let cartItems = []
        onSnapshot(userCartcolref, (snapshot) => {
          //Pushes all the documents in our snapshot into an array cartItems
          snapshot.docs.forEach((doc) => {
            cartItems.push([doc.id, doc.data().price, doc.data().quantity]);
          })
          callBack(cartItems)
        })

        console.log("cartArray")
      }

        onSnapshot(userCartcolref, (snapshot) => {
          //Uses snapshots of the docs to create a table row entry of the food, price and quantity
          snapshot.docs.forEach((doc,index) => { 
            addItemtoTable(doc.id, doc.data().price, doc.data().quantity,index)
          })

          console.log("onSnapShot")
        })
      
      //Constants used to create the buttons +, - and Remove
      const plus_val = "+";
      const minus_val = "-";
      const del_val = 'Remove';
      const total = document.getElementById("total");
      const order = document.getElementById("order");
      order.onclick = function() {
        completeOrder();
      }

      function completeOrder() {
        //Check if user has credit card
        checkCard((bool)=> {
          if(bool) {
            cartArray((array)=>{
              var tbody = document.getElementById("item_list");
              tbody.innerHTML = '';
              total.innerHTML = '';
              //Iterate through or documents array and add each item into the Orders collection
              for(let i = 0; i < array.length; i++) {
                const doc_ref = doc(db,"Users/"+user.uid+"/Orders/"+array[i][0]);
                setDoc(doc_ref, {price: array[i][1]})
              }
              //Iterate through our documents array and delete each item from the cart items then reload the page.
              for(let i = 0; i < array.length; i++) {
                let del_ref = doc(db,"Users/"+user.uid+"/CartItems/"+array[i][0]);
                deleteDoc(del_ref).then(()=>{
                  location.reload();
                })
              }
            })
          }
        })
        return alert("Order Complete")
      }
      changeTotal();
      //This function serves to display the total amount to pay for the ordered food.
      function changeTotal() {
        cartArray((array) => {
          let count = 0;
          for(var i = 0; i < array.length; i++) {
            count += (array[i][1]*array[i][2]);
          }
          total.innerHTML = "<b> Total: </b> $"+count;
        })
      }
      //This function is used to increment the quantity of the item ordered by the user.
      function incrementQuantity(event) {
        const clicked = event.target;
        cartArray((array) =>{
          console.log(array[clicked.id])
          const cart_item = doc(db,"Users/"+user.uid+"/CartItems/"+array[clicked.id][0]);
          var tbody = document.getElementById("item_list");
          tbody.innerHTML = '';
          total.innerHTML = '';
          //Updates the quantity of the item by adding 1 to it when the button is pressed.
          updateDoc(cart_item, {
            quantity: array[clicked.id][2] + 1
          })
          //Reloads the page.
          .then(()=>{
            location.reload();
          })
        });
      }
      //Function used to decrement the quantity of an item ordered by the user.
      function decrementQuantity(event) {
        const clicked = event.target;
        cartArray((array) =>{
          console.log(array[clicked.id-1])
          const cart_item = doc(db,"Users/"+user.uid+"/CartItems/"+array[clicked.id-1][0]);
          var tbody = document.getElementById("item_list");
          tbody.innerHTML = '';
          total.innerHTML = '';
          //Updates the items quantity by subtracting 1 from it.
          updateDoc(cart_item, {
            quantity: array[clicked.id-1][2] - 1
          })
          .then(()=>{
            console.log(array[clicked.id-1[2]])
            if(array[clicked.id-1][2] < 2) {
              deleteDoc(cart_item)
            }
            location.reload();
          })
        });
      }
      //Deletes an item from the users cart list.
      function deleteItem(event) {
        const clicked = event.target;
        const id_d = parseInt(clicked.id.charAt(1));
        cartArray((array) =>{
          const cart_item = doc(db,"Users/"+user.uid+"/CartItems/"+array[id_d][0]);
          var tbody = document.getElementById("item_list");
          tbody.innerHTML = '';
          total.innerHTML = '';
          deleteDoc(cart_item)
          .then(()=>{
            location.reload();
          })
        });
      }
      //Function used to add a new entry into our cart table adding items based on the users cart item collection.
      function addItemtoTable(name,price,quantity,index){
        var tbody1 = document.getElementById("item_list");
        //Creates the rows and buttons for each entry in the table adding index and class names to the buttons.
        var trow = document.createElement("tr");
        var td0 = document.createElement("td");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var plus = document.createElement("button");
        var min = document.createElement("button");
        var del = document.createElement("button");
        var br = document.createTextNode('-');
        plus.id = index;
        plus.className = "quantity";
        min.id = index+1;
        min.className = "quantity";
        del.id = "d"+index;
        del.className = "quantity";

        td0.innerHTML = name;
        td1.innerHTML = "$"+price;
       
        plus.innerHTML = plus_val;
        plus.onclick = incrementQuantity;
        td2.innerHTML = quantity;
        min.innerHTML = minus_val;
        min.onclick = decrementQuantity;
        del.innerHTML = del_val;
        del.onclick = deleteItem;

        trow.appendChild(td0);
        trow.appendChild(td1);
        
        trow.appendChild(plus);
        trow.appendChild(td2);
        trow.appendChild(min);
        trow.appendChild(br);
        trow.appendChild(del);
        tbody1.appendChild(trow);
        console.log("addItemtoTable")
      }
  }
  else {
      console.log("No current user signed in! Please sign in.");
  }
})

