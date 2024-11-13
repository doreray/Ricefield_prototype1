function EmailResetPassword() {
    return (
        <div className="sm:w-420 flex-center flex-col">
            <img src="public/assets/icons/Ricefield_logo.svg" alt="logo" />
            <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Check your inbox!</h2>
            <p className="text-dark-1 body-regular md:body-regular mt-4">
                We have just sent you an email to reset your password.
            </p>
            <p className="text-dark-1 body-regular md:body-regular mt-4">
                Please check your inbox to continue the process.
            </p>
        </div>
    )
}

export default EmailResetPassword