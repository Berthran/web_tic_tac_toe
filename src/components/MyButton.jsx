//components/MyButton.js

const MyButton = ({ to }) => {

    return (
        <a href={`/${to}`}>
            <button className="my-button">
                Take me to {to === '' ? "home" : to}
            </button>
        </a>
    )
}

export default MyButton;