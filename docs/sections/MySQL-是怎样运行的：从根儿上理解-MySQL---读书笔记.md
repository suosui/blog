# 字符集和比较规则
* 字符串在计算机里面以**二进制**的形式存储。    
　 mysql需要将字符串**编码**成二级制存进计算机。     
　 mysql需要将二进制**解码**成字符串供用户查询。
* mysql的字符集    
　　1. ASCII字符集      - 收录**128**个字符。    
　　2. ISO 8859-1字符集 - 收录**256**个字符。    
　　3. GB2312字符集     - 收录了**汉字**。    
　　4. utf8字符集       - 收录地球上能想到的所有字符。  
　　.... 等**41**个。   
　　utf8是utf8mb3的别名 1-3字节表示字符  utf8mb4 1-4字节表示字符（存储emoji）。    
   　　　 <table>
　　　        <thead>
　　　            <tr>
　　　                <th>字符集名称</th>
　　　                <th>Maxlen</th>
　　　            </tr>
　　　        </thead>
　　　        <tbody>
　　　            <tr>
　　　                <td>ascii</td>
　　　                <td>1</td>
　　　            </tr>
　　　            <tr>
　　　                <td>latin1</td>
　　　                <td>1</td>
　　　            </tr>
　　　            <tr>
　　　                <td>gb2312</td>
　　　                <td>2</td>
　　　            </tr>
　　　            <tr>
　　　                <td>gbk</td>
　　　                <td>2</td>
　　　            </tr>
　　　            <tr>
　　　                <td>utf8</td>
 　　　               <td>3</td>
　　　            </tr>
　　　            <tr>
 　　　               <td>utf8mb4</td>
　　　                <td>4</td>
　　　            </tr>
 　　　       </tbody>
　　　    </table>
# InnoDB记录存储结构
* InnoDB将数据划分为若干个页，以页作为磁盘和内存之间交互的基本单位，InnoDB中页的大小一般为 **16 KB**。也就是在一般情况下，一次最少从磁盘中读取16KB的内容到内存中，一次**最少**把内存中的16KB内容刷新到磁盘中。
* 我们平时是以记录为单位来向表中插入数据的，这些记录在磁盘上的存放方式也被称为行格式或者记录格式。    
innoDB四种行格式：    
　　1. Compact    
　　2. Redundant    
　　3. Dynamic    
　　4. Compressed    
    
    

![扫码](https://raw.githubusercontent.com/wiki/suosui/blog/images/juejin/mysql.png)