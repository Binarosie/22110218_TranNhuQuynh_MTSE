// Form submission handler for create user
document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const userData = {
        email: formData.get('email'),
        password: formData.get('password'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        address: formData.get('address'),
        phoneNumber: formData.get('phoneNumber'),
        gender: formData.get('gender'),
        roleId: formData.get('roleId')
    };

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('User created successfully!');
            this.reset();
        } else {
            alert('Error creating user');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating user');
    }
});