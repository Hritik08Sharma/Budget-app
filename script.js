//BUDGET CONTROLLER

var budgetController = (function(){
  
   var Expensis = function(id,description,value){
        this.id = id ;
        this.description = description;
        this.value = value;
   }

      var Income = function(id,description,value){
        this.id = id ;
        this.description = description;
        this.value = value;
   }
   var CalculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
           sum = sum + curr.value;
        });
        data.totals[type] = sum;
   };
   var data = {
   	allItems:{
   		exp: [],
   		inc: []
   	},

   	totals:{
   		exp: 0,
   		inc: 0
   	},
   	budget : 0 ,
   	percentage: -1
   }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expensis(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },

       
        deleteItem: function(type, id) {
            var ids, index;
           
            
            ids = data.allItems[type].map(function(current){
            	return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        CalculateBudget : function(){
        // calculate total income and expenses
       CalculateTotal('exp');
       CalculateTotal('inc');

        // calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;

        // calculate the percentage of income the we spent 
        if(data.totals.inc > 0){
        data.percentage = Math.round ((data.totals.exp / data.totals.inc)*100);
        }else{
        	data.percentage = -1;
        }
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
        
    }

})();









// UI CONTROLLER
 var UIController = (function(){
 	  var DOMstrings = {
        inputType: '#drop',
        inputDescription: '#description',
        inputValue: '#value',
        inputBtn: '#btn',
        incomeContainer:'#income-list',
        expenseContainer:'#expensis-list',
        budgetLabel : '#total',
        incomeLabel : '#income-value',
        expenseLabel : '#expensis-value',
        percentageLabel: '#expensis-percentage',
        container: '#section-3'
    };
     return {
     	getinput : function(){
     		return{
     		type : document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
     		description :  document.querySelector(DOMstrings.inputDescription).value,
     		value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
     	};
     },


          addListItem : function(obj,type){
          	var html,newhtml,element;
                // creat HTML string with placeholder text
              if(type === 'exp'){
                element = DOMstrings.expenseContainer;
               html = '<div class = "exp-list" id = "exp-%id%"><span class = "desc">%description%</span><span class = "val">%value%</span><span class = "percent">54%</span><span class="cls" id = "cls-exp"><button class="cls-btn"><i class="far fa-times-circle"></i></button></span></div>';
              }else if(type === 'inc') {
              	element = DOMstrings.incomeContainer;
              html = '<div class = "inc-list" id = "inc-%id%"><span class = "desc">%description%</span><span class = "val">%value%</span><span class="cls" id = "cls-inc"><button class="cls-btn"><i class="far fa-times-circle"></i></button></span></div>';
               
                }
                // Replace the placeholder text with some actual 
               newhtml = html.replace('%id%',obj.id);
               newhtml = newhtml.replace('%description%',obj.description);
               newhtml = newhtml.replace('%value%',obj.value);

                //insert the html into the DOM 

                document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
          },
         
            deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },

         clearFields: function(){
         	var fields;
         	fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //fields are in form of list we have to convert them into the array so that we can usethe protoype function of array
            var fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                  current.value = "";
            });
            fieldsArr[0].focus();
         },
         displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
          if(obj.percentage>0){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
          }else{
            document.querySelector(DOMstrings.percentageLabel).textContent = "---";

          }

     }
         ,

      getDOMstrings : function() {
            return DOMstrings;
        }
     };
 })();

 


//GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl,UICtrl){

var setupEventListeners = function(){
			var DOMstrings = UICtrl.getDOMstrings();

  			 document.querySelector(DOMstrings.inputBtn).addEventListener('click',ctrlAddItem);
 		  document.addEventListener('keypress',function(event){
   	if(event.keyCode === 13 || event.which === 13 ){
   		ctrlAddItem();
   	}
  	 });
 		  // using event delegation to delete elment bcz we do not have pre loaded close button (IMP technique)
    document.querySelector(DOMstrings.container).addEventListener('click',ctrlDeleteItem);
};

  var updateBudget = function(){
    // 1. Calculate the budget 
 budgetCtrl.CalculateBudget();
    // 2. Return the budget
 var budget = budgetCtrl.getBudget();
    // 3. Dispay the budget on UI
    UICtrl.displayBudget(budget);
  };


   var ctrlAddItem = function(){
   	 // 1. Get the filed input data
     var input = UICtrl.getinput();
     // console.log(input);
   
  if(input.description !== "" && !isNaN(input.value) && input.value >0 ){
    // 2. Add the item to the budget controller 
    var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
    // 3. Add the item to UI

     UICtrl.addListItem(newItem,input.type);

     //4. clear the fields

     UICtrl.clearFields();

    // 5. Calculate and update budget 
     updateBudget();
   }  
};
//  tell us what we are going to target
var ctrlDeleteItem = function(event){
	var itemId,splitID,type,ID;
    // console.log(event.target);
      itemId = event.target.parentNode.parentNode.parentNode.id;
     if(itemId){
     // inc-1 
     // split function break the string into two parts 
       splitID = itemId.split('-');
      type  = splitID[0];
      ID  = parseInt(splitID[1]);

    // 1.delte the item form the data structure 
    budgetCtrl.deleteItem(type,ID);
    // 2. delte the item from the ui
    UICtrl.deleteListItem(itemId);
    //3.update and show the new budget
     updateBudget();
     }
    

};

   return {
   	init : function(){
     console.log('app work');
    UICtrl.displayBudget({
    	 budget: 0,
         totalInc: 0,
         totalExp: 0,
         percentage: -1
    });

     setupEventListeners();
   	}
   };

})(budgetController,UIController);

controller.init();