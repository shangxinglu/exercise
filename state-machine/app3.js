function match(str){
    const targetStr = 'abcdef';
    let current = 0,
        len = targetStr.length;
    
    for(let c of str){
        if(c===targetStr[current]){
          current++;
            if(current===len) return true;
              
        } else {
          current=0;
          if(c==='a'){
           current++; 
          }
        }
    }
    
    return false;
    
  }
  
  console.log(match('1234ababcdefff'))