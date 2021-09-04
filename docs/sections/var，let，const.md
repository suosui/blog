### js 先编译再执行    
　　例子：var a = 2;     
　　js引擎会把上述语句分成2阶段。var a; (编译阶段) 和 a = 2;(执行阶段), 即 声明是在编译阶段，赋值操作是在执行阶段。编译阶段我们的代码会变成这样：    
　　var a;    
　　a = 2; (等待被执行)    
像是变量被“移动”到了最上面。这就叫**变量提升**。而let和const则不会出现变量提升。    
### 暂时性死区 
   因为var会变量提升，而let,const不会变量提升。所以let,const存在暂时性死区。即在let,const 变量声明之前提前调用该变量。let,const 会报Reference Error。  
   暂时性死区意味着typeof不会100%安全。    

     etc: typeof(x) //reference error     
          let x   
     但是typeof一个未被声明的变量反而不会报错。    

### 函数和块  
　　函数：function(){}    
　　块：{}    
　　**var是函数作用域。let和const是块级作用域**。块级作用域的例子：for(){}, while(){}, switch(){}    
### 重复声明   
　　var 可以被重复声明，后声明的会覆盖之前的声明。   
　　let，const 不可以被重复声明。const 不可以被重复赋值。
### typeof
   

