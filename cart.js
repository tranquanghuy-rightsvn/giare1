$(document).ready(async function(){
  let province_object = {}
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")
  load_shipping_price()
  load_carts(carts)
  let response = await  fetch('./json/vietnam/Index.json');
  const provinces_object = await response.json();
  load_provinces(provinces_object)
  load_infor_customer(provinces_object, carts)
  $('#customer-province').on('change', async function(){
    let province = $(this).val()
    let province_response = await fetch('json/vietnam/' + provinces_object[province].file_path)
    province_object = await province_response.json()
    let district_array = province_object.district.map((dt) => {return dt.name })
    $('#customer-district').html('<option></option>')
    $('#customer-ward').html('<option></option>')
    district_array.map((dt) => {
      $('#customer-district').append('<option>' + dt + '</option>')
    })
    load_shipping_price()
    load_sum(carts)
  })

  $('#customer-district').on('change', async function(){
    let current_district = province_object.district.find((dt) => {return dt.name == $(this).val()})
    let ward_array = current_district.ward.map((w) => {return w.name})
    $('#customer-ward').html('<option></option>')
    ward_array.map((w) => {
      $('#customer-ward').append('<option>' + w + '</option>')
    })
  })
})

function minus_item(button){
  let price_quantity = $(button).siblings('input').val()
  let product_id = $(button).closest('.cart-line-item').data('product')
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")
  let product = carts.find((p) => {return p.product_id == product_id})

  if(price_quantity > 1){
    product.price -= product.price/product.quantity
    product.quantity -= 1
  }

  localStorage.setItem('carts', JSON.stringify(carts))
  load_carts(carts)
}

function add_item(button){
  let price_quantity = $(button).siblings('input').val()
  let product_id = $(button).closest('.cart-line-item').data('product')
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")
  let product = carts.find((p) => {return p.product_id == product_id})

  product.price += product.price/product.quantity
  product.quantity += 1

  localStorage.setItem('carts', JSON.stringify(carts))
  load_carts(carts)
}

function remove_item(icon){
  let product_id = $(icon).closest('.cart-line-item').data('product')
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")
  carts.forEach(function(p, i){
    if(p.product_id == product_id){ carts.splice(i, 1)}
  })
  localStorage.setItem('carts', JSON.stringify(carts))
  load_carts(carts)
  load_count_cartable()
}

function load_carts(carts){
  if(carts.length > 0){
    $('.list-cart').html('')
    carts.map(function(product){
      $('.list-cart').append("<div class=\"cart-line-item\" data-product=\"" + product.product_id + "\"><div class=\"row\"><div class=\"col-lg-2 col-md-6 col-sm-6 col-xs-12 cart-item\"><img src=\"" + product.img_url + "\" /></div><div class=\"col-lg-3 col-md-6 col-sm-6 col-xs-12 cart-item\"><h3>" + product.title  + '</h3></div><div class="col-lg-3 col-md-6 col-sm-6 col-xs-12 cart-item"><div class="pd-2"><button class="cart-item-button" onclick="minus_item(this)">-</button><input type="number" value="' + product.quantity + '"> <button class="cart-item-button" onclick="add_item(this)">+</button></div></div><div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 cart-item space-beetween"><p>' + display_price(product.price) + '</p><i class="fas fa-trash" onclick="remove_item(this)"></i></div></div></div>')

    })
  }else{
    $('.list-cart').html('<i>Bạn chưa chọn sản phẩm</i>')
  }
  load_sum(carts)
}

function display_price(number){
  return "đ " + formatPrice(number)
}

function formatPrice(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function load_count_cartable(){
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")

  if(carts.length > 0){
    $('.uni-cartable i.fas.fa-shopping-cart').append('<span class="count-product-in-carts">' + carts.length + '</span>')
  }else{
    $('.uni-cartable i.fas.fa-shopping-cart').html('')
  }
}

function load_sum(carts){
  var totalPrice = carts.reduce(function(accumulator, currentValue) {
    return accumulator + currentValue.price;
  }, 0);
  let shipping_price = parseInt(get_price($('.shipping-price').text()) || '0')
  $('.total-price').text(display_price(totalPrice + shipping_price))
}

function load_shipping_price(){
  let customer_province = $('#customer-province').val()
  let store_provinces = $('#store-information').data('provinces')
  let inner_province_ship = $('#store-information').data('inner-province')
  let outer_province_ship = $('#store-information').data('outer-province')

  if(customer_province){
    if (store_provinces.includes(customer_province)){
      $('.shipping-price').text(display_price(inner_province_ship))
    }else{
      $('.shipping-price').text(display_price(outer_province_ship))
    }
  }else{
    $('.shipping-price').text(display_price(0))
  }
}

function get_price(string){
  return parseInt(string.replace(/[^0-9]/g, ''));
}

async function load_provinces(provinces_object){
  const provinces = Object.keys(provinces_object)
  $('#customer-province').html('<option></option>')
  provinces.forEach((province) => {
    $('#customer-province').append('<option>' + province + '</option>')
  })
}

async function buy(){
  let province = $('#customer-province').val()
  let phone_number = $('#customer-phone-number').val()
  let full_address = $('#customer-address').val() + ', ' + $('#customer-ward').val() + ', ' + $('#customer-district').val() + ', ' + $('#customer-province').val() + '. Số Điện Thoại: ' + $('#customer-phone-number').val()
  let carts = JSON.parse(localStorage.getItem('carts') || "[]")
  let data_website = $('#data-website').data('website')
  let order_products = []

  carts.forEach((pro) => {
    order_products.push({ "product_id": pro.product_id, "quantity": pro.quantity  })
  })

  let data = {
    "data-website": data_website,
    "order_info": {
      "order_code": generate_order_code(),
      "province": province,
      "address": full_address,
      "phone_number": phone_number,
      "order_products": JSON.stringify(order_products)
    }
  }

  if($('#customer-address').val() != "" && $('#customer-ward').val() != "" && $('#customer-district').val() != "" && $('#customer-phone-number').val() != "" && carts.length > 0) {
    let response = await $.post({
      url: "http://localhost:3000/api/orders",
      data: data
    });

    if(response.status == 200){
      localStorage.removeItem("carts")
      orders = JSON.parse(localStorage.getItem("orders") || "[]")
      orders.push(response.order_code)
      localStorage.setItem("orders", orders)
      if($('#save_infor-user').prop('checked')){
        let infor_customer = {}
        infor_customer.province = $('#customer-province').val()
        infor_customer.phone_number = $('#customer-phone-number').val()
        infor_customer.ward = $('#customer-ward').val()
        infor_customer.district = $('#customer-district').val()
        infor_customer.fullname = $('#customer-fullname').val()
        infor_customer.address = $('#customer-address').val()

        localStorage.setItem('infor-customer', JSON.stringify(infor_customer))
      }else{
        localStorage.removeItem('infor-customer')
      }
      alert("Đặt hàng thành công")
      window.location.href = 'cart.html'
    }else{
      alert("Có lỗi xảy ra khi đặt hàng")
    }
  }else{
    alert("Vui lòng chọn sản phẩm và điền thông tin giao hàng")
  }
}

function generate_order_code(){
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  return shuffle(alphabet.split("")).join("").slice(0,3) + shuffle(numbers.split("")).join("").slice(0,3)
}

function shuffle(array){
  array.reduce((currentArray, currentValue, index, array) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    const temp = currentArray[index];
    currentArray[index] = currentArray[randomIndex];
    currentArray[randomIndex] = temp;
    return currentArray;
  }, array)
  return array
}

async function load_infor_customer(provinces_object, carts){
  let infor_customer = JSON.parse(localStorage.getItem('infor-customer'))

  if(infor_customer){
    $('#customer-province').val(infor_customer.province)
    $('#customer-phone-number').val(infor_customer.phone_number)
    $('#customer-fullname').val(infor_customer.fullname)
    $('#customer-address').val(infor_customer.address)
    $('#save_infor-user').prop('checked', true)

    let province = infor_customer.province
    let province_response = await fetch('json/vietnam/' + provinces_object[province].file_path)
    let province_object = await province_response.json()
    let district_array = province_object.district.map((dt) => {return dt.name })
    $('#customer-district').html('<option></option>')
    district_array.map((dt) => {
      $('#customer-district').append('<option>' + dt + '</option>')
    })
    load_shipping_price()
    load_sum(carts)

    let current_district = province_object.district.find((dt) => {return dt.name == infor_customer.district})
    let ward_array = current_district.ward.map((w) => {return w.name})
    $('#customer-ward').html('<option></option>')
    ward_array.map((w) => {
      $('#customer-ward').append('<option>' + w + '</option>')
    })
    $('#customer-district').val(infor_customer.district)
    $('#customer-ward').val(infor_customer.ward)
  }
}

