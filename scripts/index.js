
var size = 2**11;//定义的音频数组长度 <=2**14

var 幂=1.7;

var box = document.getElementsByClassName('right')[0];

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

box.appendChild(canvas);

var mv = new Musicvisualizer({
	size:size,
	draw:draw
});

var height,width;

var Dots = [];

function getDots(){
	Dots.length=0;
	var sizei,sizei_,sizeij,sizei1,dot,i,j,k;
	sizeij=0;
	for(i=0;i<width;i++){
		sizei=parseInt(sizef*i**幂);
		Dots.push({
			y:0,//高度
			v:0,//速度
			zy:0,//矩形高度
			sizei:sizei,//
			sizei1:0
		});
	}
	for(var i=0;i<Dots.length;i++){
		dot=Dots[i];
		sizei=dot.sizei;
		if(sizef2>i){
			if(sizei==sizei_){

			}else{
				k=i-sizeij;
				for(j=0;j<k;j++){
					sizei1=j/k;
					Dots[j+sizeij].sizei1=sizei1;
				}
				sizeij=i
			}
			sizei_=sizei
		}else{
			dot.sizei1=sizei-Dots[i-1].sizei;
		}
	}
}

//非线性频谱;自变量 width 因变量 size
// size=sizef*width**幂;
// 对其求导, 计算斜率为1时的x
// 1=幂*sizef*width**(幂-1)
//width**(幂-1)=1/幂/sizef
//width=(1/(幂)/sizef)**(1/(幂-1)) //此时一个像素正好是一个音频数据量;小于时,多个像素有一个音频数据量;大于时,一个像素有多个音频数据量
var sizef=0;
var sizef2=0;
var heightj;

/**
 * [resize 根据窗口大小改变canvas画布大小]
 * @return {[type]} [description]
 */
function resize(){
	scale = window.devicePixelRatio;
	height = box.clientHeight*scale;
	width = box.clientWidth*scale;
	canvas.width = width;
	canvas.height = height;
	
	canvas.style.width = canvas.width / scale + 'px';
	canvas.style.height= canvas.height/ scale + 'px';

	heightj=(height-100)/256;//音频数据最大值256

	sizef=size/width**幂;
	sizef2=(1/幂/sizef)**(1/(幂-1));
	if(sizef2<1){
		sizef2=1;
	}

	getDots();
}
resize();
window.onresize = resize;


var vol = document.getElementById("volume");
vol.onchange = function(){
	mv.changeVolumn(this.value/this.max);
}
mv.changeVolumn(0.6);//初始化音频大小


var f0,f1,fps;
f0=0;
f1=Date.now();
fps=0;


var ra,rectWidthI,t1h,rectHeight,o,j,sum1;
var rectWidth = 1;
var cw = 1;
var capHeight=1

function draw(arr){
	ctx.clearRect(0,0,width,height);//每次绘制时，清空上次画布内容
	ctx.font = "20px Arial";
	//ctx.fillStyle = line;
	//var rectWidth = width/size;
	//var cw = rectWidth*1+1;
	//var cw = rectWidth*0.6;
	//var capHeight = cw > 10?10:cw;//防止上面矩形过高
	for(var i=0;i<width;i++){
		o = Dots[i];

		rectWidthI=rectWidth*i;
		if(o.sizei1){
			if(sizef2>i){
				rectHeight = arr[o.sizei]*heightj*(1-o.sizei1)+arr[o.sizei+1]*heightj*o.sizei1;
			}else{
				/*
				//平均值
				sum1=0;
				for(j=o.sizei;j>o.sizei-o.sizei1;j--){
					sum1+=arr[j];
				}
				rectHeight = sum1/o.sizei1*heightj;
				*/
				//最大值
				max1=0;
				for(j=o.sizei;j>o.sizei-o.sizei1;j--){
					if(arr[j]>max1){
						max1=arr[j];
					}
				}
				rectHeight = max1*heightj;
			}
		}else{
			rectHeight = arr[o.sizei]*heightj;
		}
		// 绘制矩形条（x,y,width,height）; rectWidth*0.6使矩形之间有间隙
		ctx.fillStyle="#00000066";
		ctx.fillRect(rectWidthI,height-rectHeight,cw,rectHeight);

		//*
		ra=rectHeight;
		ctx.fillStyle="#000000ff";
		//小方块匀加速下落
		t1h=0;

		if(o.y<ra){
			o.y=ra;
			o.v=(rectHeight-o.zy)*0.4-o.v*0.5;//碰撞后反弹, 损失一定速度
		}
		if(o.y>height){
			o.y=height-2;
			o.v=-o.v*0.5;//碰顶反弹
		}
		o.v-=0.4;//重力加速度
		o.y+=o.v;
		o.zy=rectHeight;
		ctx.fillRect(rectWidthI,height-(o.y+capHeight),cw,capHeight);
		//*/
	}
	//*
	f0++;
	if(f0==32){
		f0=0;
		f1_=Date.now();
		fps=32/(f1_-f1)*1000;
		f1=f1_;
	}
	//ctx.fillStyle = "white";
	ctx.fillText("FPS:"+Math.round(fps),width-80,20);
	
	/*/
	f1_=Date.now();
	
	ctx.fillText(f1_-f1+'ms',width-100,20);
	f1=f1_;
	//*/
}


document.getElementById("loadfile").onchange = function(){
	var file = this.files[0];
	var fr = new FileReader();

	fr.onload = function(e){
		// 重写play方法  这边e.target.result已经是arraybuffer对象类型，不再是ajax路径读入
		mv.play(e.target.result);
	}
	fr.readAsArrayBuffer(file);
}
