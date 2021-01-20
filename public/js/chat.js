const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


const $bottomButton = document.querySelector('#scrollDown')
$bottomButton.addEventListener('click',()=>{
    $messages.scrollTop = $messages.scrollHeight
})


// Templates
const messageTemplate = document.querySelector('#message-template-self').innerHTML
const messageTemplate2 = document.querySelector('.template-mes').innerHTML
const locationTemplate = document.querySelector('#location-template-self').innerHTML
const locationTemplate2 = document.querySelector('.template-loc').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template-self').innerHTML
const sidebarTemplate2 = document.querySelector('.template-side').innerHTML

//Options
const {username , room} = Qs.parse(location.search , { ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message2', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate2, {
        username2: message.username,
        message2: message.text,
        createdAt2: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (loc) => {
    console.log(loc)
    const html = Mustache.render(locationTemplate, {
        username: loc.username,
        loc: loc.text,
        createdAt: moment(loc.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage2', (loc) => {
    console.log(loc)
    const html = Mustache.render(locationTemplate2, {
        username2: loc.username,
        loc2: loc.text,
        createdAt2: moment(loc.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({ room, users, UserName}) => {
    const html = Mustache.render(sidebarTemplate, {
        room : room,
        users: users,
        UserName : UserName.username
    })
    document.querySelector('#sidebar').innerHTML = html
})
socket.on('roomData', ({ room, users, UserName}) => {
    const html = Mustache.render(sidebarTemplate2, {
        room2 : room,
        users2: users,
        UserName2 : UserName.username
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join', { username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})