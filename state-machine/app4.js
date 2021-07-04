
function match(str){
  
    let status = start;
    
    for(let c of str){
        status = status(c);
    }
    
    if(status===end) return true;
    
    return false;
  
  }
    
    function start(c){
        if(c==='a'){
           return findB;
        } else {
           return start; 
        }
    }
  
  
   function findB(c){   
      if(c==='b'){
          return findC;
      }
    
      return start(c);
    }
  
    function findC(c){
     if(c==='c'){
          return findA1;
      }
      return start(c);
    }
    
    function findA1(c){
     if(c==='a'){
          return findB1;
      }
     return start(c);
    }
    
    function findB1(c){
     if(c==='b'){
          return findX;
      }
     return start(c);
    }
  
    function findX(c){
      if(c==='x'){
          return end;
      }
       return start(c);
    }
    
    function end(){
       return end;
    }
    
  
  
  console.log(match('123abcabx'));
  
  