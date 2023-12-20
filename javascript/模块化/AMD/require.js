
(function(){
    var moduleMap = {}
    window.define = function (name,deps, callback) {
        const args = []
        deps.forEach(function(dep){
           args.push(moduleMap[dep])
       })

         moduleMap[name] = callback.apply(null,args)

    }

    window.require = function (name,callback) {

        const deps = name.map(item=>{
            return {
                name:item,
                completed:false
            }
        })

        name.forEach(function(item){
            const script = document.createElement('script')
            script.src = name + '.js'
             document.head.appendChild(script)
                script.onload = function(){
                    deps.forEach(function(dep){
                        if(dep.name===item){
                            dep.completed = true
                        }
                    })
                    
                if(deps.every(item=>item.completed===true)){
                    const args = []
                    deps.forEach(function(dep){
                        args.push(moduleMap[dep.name])
                    })
                    callback.apply(null,args)
                }
            }
              
        })

       
        
        return moduleMap[name]
    }
})()


