function search_nav(){
  let search = document.getElementById('formSearchNav').value
  window.location.href = "search.html?search=" + decodeURI(search)
}

function add_to_cart(button){
  let img_url = $(button).closest('.product-card').find('.product-image img').attr('src')
  let title = $(button).closest('.product-card').find('.product-information').find('h3').text()
  let price = format_price($(button).closest('.product-card').find('.product-information').find('p').text())
  let product_id = $(button).closest('.product-card').data('product')
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")
  let exists_cart = carts.find(function(product){return product.product_id == product_id})

  if(!exists_cart){
    carts.push({
      title: title,
      price: price,
      img_url: img_url,
      product_id: product_id,
      quantity: 1
    })
  }

  localStorage.setItem('carts', JSON.stringify(carts))
  load_count_cartable()
}

function format_price(string){
  return parseInt(string.substring(2).replaceAll(".", ""))
}

$(document).ready(function(){
  let cartable = $('nav ul').hasClass('uni-cartable')

  if(cartable){
    load_count_cartable()
  }
})

function load_count_cartable(){
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")

  if(carts.length > 0){
    $('.uni-cartable i.fas.fa-shopping-cart').append('<span class="count-product-in-carts">' + carts.length + '</span>')
  }else{
    $('.uni-cartable i.fas.fa-shopping-cart').html('')
  }
}

var lazyClass = $('.lazy-area');

$(window).on("scroll", async function() {
  lazyClass.each(function() {
    var elementOffset =  $(this).offset().top;
    var windowHeight = $(window).height();
    var scrollPosition = $(window).scrollTop();


    if (elementOffset < (scrollPosition + windowHeight)) {
      let children = $(this).siblings(".row").children()
      let span = $(this)
      if($(children[children.length - 1]).data('called') != 'done'){
        $(children[children.length - 1]).attr('data-called', 'done')
        let model = $(this).data('model')
        let type = $(this).data('type')
        let limit = 6
        let website_data = $('#data-website').data('website')
        let category = ''
        if(model == 'product'){
          category = $(this).closest('.product-list.container').find('h2').text()
        }else{
          category = $(this).closest('.post-list.container').find('h2').text()
        }

        $.get('http://localhost:3000/api/lazyload?model=' + model + '&type=' + type + '&limit=' + limit + '&category=' + category + '&website_data=' + website_data + '&offset=' + (children.length - 1), function(data, status){
          if(model == 'product'){
            data.data.resources.forEach((resource, i) => {
              span.siblings(".row").append("<div class=\"col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12\"><div class=\"product-card\"><a href=\"" +  resource.url + "\"><div class=\"product-image\"><img src=\"" +  resource.image_url + "\"></div><div class=\"product-information\"><h3>" + resource.title + "</h3><p>đ " + resource.price + "</p><button class=\"btn btn-outline-danger btn-product\"><i class=\"fa-solid fa-cart-plus\"></i> Thêm vào giỏ hàng</button></div></a></div></div>")
            })
          }else{
            data.data.resources.forEach((resource, i) => {
              span.siblings(".row").append("<div class=\"col-lg-3 col-sm-6 col-xs-12\"><a href=\"" + resource.url + "\"><div class=\"post-item\"><img src=\"" + resource.image_url + "\"><h4>" + resource.title + "</h4></div></a></div>")
            })
          }
        })
      }
    }
  });
});

lazyClass.each(function() {
  lazyLoadResources($(this));
})

function lazyLoadResources(span) {
  var elementOffset =  span.offset().top;
  var windowHeight = $(window).height();
  var scrollPosition = $(window).scrollTop();
  if (elementOffset < windowHeight) {
    let children = span.siblings(".row").children()
    let lastChild = $(children[children.length - 1]);
    if (lastChild.data('called') !== 'done') {
      lastChild.attr('data-called', 'done');

      let model = span.data('model');
      let type = span.data('type');
      let limit = 6
      category = ''
      if(model == 'product'){
        category = span.closest('.product-list.container').find('h2').text() || ''
      }else{
        category = span.closest('.post-list.container').find('h2').text() || ''
      }
      console.log('dkmm')
      console.log(category)
      let website_data = $('#data-website').data('website');

      $.get('http://localhost:3000/api/lazyload?model=' + model + '&type=' + type + '&limit=' + limit + '&category=' + category + '&website_data=' + website_data + '&offset=' + (children.length - 1), function(data, status) {
        data.data.resources.forEach((resource, i) => {
          if(model == 'product'){
            span.siblings(".row").append("<div class=\"col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12\"><div class=\"product-card\"><a href=\"" +  resource.url + "\"><div class=\"product-image\"><img src=\"" +  resource.image_url + "\"></div><div class=\"product-information\"><h3>" + resource.title + "</h3><p>đ " + resource.price + "</p><button class=\"btn btn-outline-danger btn-product\"><i class=\"fa-solid fa-cart-plus\"></i> Thêm vào giỏ hàng</button></div></a></div></div>")
          }else{
            span.siblings(".row").append("<div class=\"col-lg-3 col-sm-6 col-xs-12\"><a href=\"" + resource.url + "\"><div class=\"post-item\"><img src=\"" + resource.image_url + "\"><h4>" + resource.title + "</h4></div></a></div>")
          }
        });

        lazyLoadResources(span);
      });
    }
  }
}
