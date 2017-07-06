// this lets us change the meta tags in the document.
var _setMeta = (function($){
    return {
        setPost:function(title,description,type,category,subcategory=null,artist=null){
            let t_description = `${description.substring(0,30)}... ${type}:${category}${subcategory ? ":" + subcategory : ''}`;
            if(type === 'music'){ $('title').text(`${artist} - ${title} music:${category}` );  document.title = `${artist} - ${title} ${type}:${category}`;}
            else { $('title').text(`${title} - ${type}:${category}${subcategory ? ";" + subcatgory : ""}`); document.title = `${title} ${type}:${category}`; } 
            $('link[rel="canonical"]').attr('href', location.toString());
            $('header').prepend(`<meta property='og:title' content='${t_description}'>`);
            $('header').prepend(`<meta property='og:url' content='${location.toString()}'>`);
            $('header').prepend(`<meta property='twitter:title' content='${t_description}'>`);
            $('header').prepend("<meta property='og:ttl' content='600'>");
        }, 
        setType:function(type){
            $('title').text(type);
            document.title = type;
            $('link[rel="wcanonical"]').attr('href', location.toString());
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
        },
        setCategory:function(type,category,subcategory=null){
            $('title').text(`${subcategory ? category + " - " + subcategory + " " + type : category + " " + type }`);
            document.title = `${subcategory ? category + " - " + subcategory + " " + type : category + " " + type }`;
            $('link[rel="canonical"]').attr('href', location.toString());
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
        },
        setProfile:function(user){
            $('title').text(`${user}'s profile`);
            document.title = `${user}'s profile`;
            $('link[rel="canonical"]').attr('href', location.toString());
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
        },
        setHome:function(){
            $('title').text('Way Dope: Entertainment Hub of Tomorrow');
            document.title = 'Way Dope: Entertainment Hub of Tomorrow';
            $('link[rel="canonical"]').attr('href', location.toString());
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
        },
        setOther:function(){
            $('title').text(title);
            document.title = tite;
            $('link[rel="canonical"]').attr('href', location.toString());
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
            $("meta[property='og:title']").remove();
        }
    }
})(jQuery);