// Load and display users
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('userTableBody').innerHTML = 
            '<tr><td colspan="5" class="text-center text-danger">Error loading users</td></tr>';
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('userTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.address || 'N/A'}</td>
            <td>
                <a href="/users/edit?id=${user._id}" class="btn btn-warning btn-sm btn-action">Edit</a>
                <button class="btn btn-danger btn-sm btn-action delete-btn" data-id="${user._id}">Delete</button>
            </td>
        </tr>
    `).join('');

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this user?')) {
                await deleteUser(userId);
            }
        });
    });
}

// Delete user function
async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('User deleted successfully!');
            await loadUsers();
        } else {
            alert('Error deleting user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadUsers);