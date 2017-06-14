// get the element from the DOM
var element = document.getElementById('choose-collection')

// attach a function to the change event
// this'll get fired when the select value changes, as the event name implies
element.onchange = function () {

  // "element.value" is the selected value in the select element
  // so if the user selects 'gabyguedezh', they'll be redirected to '/data/gabyguedezh'
  // if you just pass a subdomain (the stuff past localhost:5000), the browser will be smart enough to know it's the same website, so no need to worry about that

  window.location.assign('/show_tweets/' + element.value)
}