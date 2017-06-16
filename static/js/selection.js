// Get the element from the DOM
var element = document.getElementById('choose-collection')

// Attach a function to the change event
// This function will be called when the select value changes, as the event name implies
element.onchange = function () {

    // Insert selected html element to option "element.value" which is the selected value in the select element
    

    // So if the user selects 'gabyguedezh', they'll be redirected to '/data/gabyguedezh'
    // And the HTML <option> will have the "selected" attribute injected dynamically

    // If you just pass a subdomain to the URL (sub-domain is the address past localhost:5000)
    // the browser will be smart enough to know it's the same website
    // and it only needs to append /show_tweets/ + element.value

  window.location.assign('/show_tweets/' + element.value)
}