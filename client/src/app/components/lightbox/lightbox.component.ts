import { Component, OnChanges, OnInit, OnDestroy, Input} from '@angular/core';
import { Http } from '@angular/http';
import {PhotosService} from '../../services/photos.service';
import 'angular2-materialize';
import {VideoService} from '../../services/video.service';
declare var $;
declare var videojs;

@Component({
  selector: 'lightbox',
  templateUrl: 'lightbox.component.html',
})

export class LightBoxComponent implements OnInit {
    @Input() video:any;
    subscription:any;
    photos:any=[];
    loaded:boolean=false;
    myInstance:any;
    video_url:string;
    videoJSplayer:any;
    link:string;
    link_type:number;
    form:number;
	constructor(private _vidService:VideoService){};
	ngOnInit(){
       this.subscription =  this._vidService.videoChange.subscribe((value)=>{
            // It's doing the stupid angular thing again. Can't find a provider for this. Oh well, will just use jquery.
            // this.video_url = videoChange[0];
            this.form = value[1];
            this.link_type = !this.form ? value[2] : undefined;
            $("#lightbox").css({'top':($(document).scrollTop()-($("#lightbox").height()/1.4))})
            $(`#video-lightbox-source`).prop("src", value[0])
            if(this.form){
                $(`<video id="video-lightbox" class="video-js vjs-default-skin vjs-big-play-centered video-lightbox video-js-thumbnail"  controls preload="auto">
                    <source id='video-lightbox-source' src="" type="video/mp4" />
                    <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank" rel="noopener">supports HTML5 video</a></p>
                </video>`).appendTo("#lightbox")
                setTimeout(()=>{
                    this.initVideo(value[0]); 
                },10)
            }
            else this.link = value[0]
            setTimeout(()=>{
                this.setBox();
            },150)
        })
	};
    initVideo(url){
		setTimeout(()=>{  
                    let player = videojs('video-lightbox');
                    player.src({src:url})
                    player.play();
                    this.videoJSplayer = player;
                    // player.src({ });
					// let video = videojs(`video-lightbox`, {}, function() {
           			//  // This is functionally the same as the previous example.
        			// });
					// this.videoJSplayer = video;
		},1)
	}
    // ngOnChanges(changes:any):void {
    //     var photoChanges:any = changes.photos.currentValue;
	// 	if (photoChanges) {
    //         this.photos = photoChanges.photos;
    //         this.loaded = true;
    //     }
	// };

    getImageWidth(){
        for(let id=0; id < this.photos.length; id++){
            let image_object = new Image();
            image_object.src = $(`#rest-images-${id}`).attr("src");

			let native_width = image_object.width;
			let native_height = image_object.height;

            if(native_height > native_width && native_height > 148){
                let multiplier = 148 / native_height
                let new_width = native_width * multiplier;
                $(`#rest-images-${id}`).height(148).width(new_width)
            } else if (native_height > native_width && native_height <= 148) {
                $(`#rest-images-${id}`).height(native_height).width(native_width)
            } else if (native_width > native_height && native_width > 300){
                let multiplier = 300 / native_width;
                let new_height = (native_height * multiplier) < 149 ? (native_height * multiplier) : 148;
                $(`#rest-images-${id}`).height(new_height).width(300);
            } else {
                $(`#rest-images-${id}`).height(native_height).width(native_width)
            }
            $(`#rest-images-${id}`).css({'display':'initial'});
        }
    }
    checkMainPhoto(){
            let image_object = new Image();
			image_object.src = $("#main-lightbox-photo").attr("src");
			
			let native_width = image_object.width;
			let native_height = image_object.height;
            
            
            if(native_height > native_width && native_height > 400){
                let multiplier = 400 / native_height
                let new_width = native_width * multiplier;
                $("#main-lightbox-photo").height(400).width(new_width)
            } else if (native_height > native_width && native_height <= 400) {
                $("#main-lightbox-photo").height(native_height).width(native_width)
            } else if (native_width > native_height && native_width > 500){
                let multiplier = 500 / native_width;
                let new_height = native_height * multiplier;
                $("#main-lightbox-photo").height(new_height).width(500);
            } else {
                $("#main-lightbox-photo").height(native_height).width(native_width)
            }

    }
    watchExit(){
        $('.dark-overlay, #close-lightbox').click(()=>{
            $('body').css({'width':'initial', 'overflow':'initial'});
            // may want to change from fades.
            $('#dark-overlay').fadeOut(function(){
                $(this).remove();
            });
            this.form = null;
            $('#lightbox').fadeOut()
            $(".dark-overlay, #close-lightbox").unbind( "click" );
            $("#lightbox").unbind( "click" );
            if(this.videoJSplayer){
                setTimeout(()=>{
                    this.videoJSplayer.dispose();
                    this.videoJSplayer = null;
                },300)
            }
            $(document).unbind("keyup")
        });
        $(document).keyup((e)=>{
            if(e.keyCode === 27) $(".dark-overlay").trigger('click');
        })
        $('#lightbox').click(()=>{
            event.stopPropagation();
        })
    }

    // See this codepen for more info on this magnify:
    // http://codepen.io/Gmansory/pen/WoNdKm

    // magnify(){
    //     let native_width = 0;
    //     let native_height = 0;
    //     $(".magnify").mousemove(function(e){
	// 	//When the user hovers on the image, the script will first calculate
	// 	//the native dimensions if they don't exist. Only after the native dimensions
	// 	//are available, the script will show the zoomed version.
	// 	if(!native_width && !native_height)
	// 	{
	// 		//This will create a new image object with the same image as that in .small
	// 		//We cannot directly get the dimensions from .small because of the 
	// 		//width specified to 200px in the html. To get the actual dimensions we have
	// 		//created this image object.
	// 		var image_object = new Image();
	// 		image_object.src = $(".small").attr("src");
			
	// 		//This code is wrapped in the .load function which is important.
	// 		//width and height of the object would return 0 if accessed before 
	// 		//the image gets loaded.
	// 		native_width = image_object.width;
	// 		native_height = image_object.height;
	// 	}
	// 	else
	// 	{
	// 		//x/y coordinates of the mouse
	// 		//This is the position of .magnify with respect to the document.
	// 		var magnify_offset = $(this).offset();
	// 		//We will deduct the positions of .magnify from the mouse positions with
	// 		//respect to the document to get the mouse positions with respect to the 
	// 		//container(.magnify)
    //         
	// 		var mx = e.pageX - magnify_offset.left;
	// 		var my = e.pageY - magnify_offset.top;
    //         
			
	// 		//Finally the code to fade out the glass if the mouse is outside the container
	// 		if(mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0)
	// 		{
	// 			$(".large").fadeIn(100);
	// 		}
	// 		else
	// 		{
	// 			$(".large").fadeOut(100);
	// 		}
	// 		if($(".large").is(":visible"))
	// 		{
	// 			//The background position of .large will be changed according to the position
	// 			//of the mouse over the .small image. So we will get the ratio of the pixel
	// 			//under the mouse pointer with respect to the image and use that to position the 
	// 			//large image inside the magnifying glass
	// 			var rx = Math.round(mx/$(".small").width()*native_width - $(".large").width()/2)*-1;
	// 			var ry = Math.round(my/$(".small").height()*native_height - $(".large").height()/2)*-1;
	// 			var bgp = rx + "px " + ry + "px";
				
	// 			//Time to move the magnifying glass with the mouse
	// 			var px = mx - $(".large").width()/2;
	// 			var py = my - $(".large").height()/2;
	// 			//Now the glass moves with the mouse
	// 			//The logic is to deduct half of the glass's width and height from the 
	// 			//mouse coordinates to place it with its center at the mouse coordinates
				
	// 			//If you hover on the image now, you should see the magnifying glass in action
	// 			$(".large").css({left: px, top: py, backgroundPosition: bgp});
	// 		}
	// 	}
	// })

    // }
    public setBox(){ 
        // may want to change from fades.
        $('#lightbox').fadeIn()
        $('body').css({'width':window.innerWidth, 'overflow':'hidden'});
        $('body').append(`<div id='dark-overlay' class='dark-overlay' style='z-index:1002;display:block;opacity:0.5;'></div>`)
        setTimeout(()=>{
            this.watchExit();
            // this.magnify();
        },250);
    }
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.videoJSplayer) this.videoJSplayer.dispose();
    }
}
