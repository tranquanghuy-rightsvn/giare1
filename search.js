$(document).ready(function() {
  $('#formSearch').val(getUrlParameter('search'))

  let data_website = $('#data-website').data('website')

  $.get("http://localhost:3000/api/search?search=" + decodeURI($('#formSearch').val()) + "&data-website=" + data_website, function(data, status){
    if(!("products" in data)){
      $('#product').remove()
      $('#product-tab').parent().remove()
    }else{
      if(data.products.length == 0){
        $('#product').html("<i>Không tìm thấy sản phẩm </i>")
      }else{
        $('#product').html("")
        data.products.map((product) => {
          $('#product').append("<div class=\"product-search-box\"><img src=\"" + product.image + "\" ><div class=\"product-search-text\"><a href=\"" + product.url +  "\"><h3>" + product.title + "</h3><p>" + product.description + "</p></a></div></div>")
        })
      }
    }

    if(!("posts" in data)){
      $('#post').remove()
      $('#post-tab').parent().remove()
    }else{
      if(data.posts.length == 0){
        $('#post').html("<i>Không tìm thấy bài viết </i>")
      }else{
        $('#post').html("")
        data.posts.map((post) => {
          $('#post').append("<div class=\"post-search-box\"><img src=\"" + post.image + "\" ><div class=\"post-search-text\"><a href=\"" + post.url +  "\"><h3>" + post.title + "</h3><p>" + post.description + "</p></a></div></div>")
        })
      }
    }

    $("#searchTab").children("li").first().find("button").addClass('active');
    $("#searchTabContent").children("div").first().addClass('active')
    $("#searchTabContent").children("div").first().addClass('show')
  });
});

function search(){
  window.location.href = "search.html?search=" + decodeURI($('#formSearch').val())
}

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
};
