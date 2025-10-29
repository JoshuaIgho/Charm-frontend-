// syncUser.js
import { API_URL } from '../services/api';
const CHECK_USER_BY_CLERK_ID = `
  query CheckUserByClerkId($clerkId: String!) {
    users(where: { clerkId: { equals: $clerkId } }) {
      id
      clerkId
      email
      name
    }
  }
`;

const CHECK_USER_BY_EMAIL = `
  query CheckUserByEmail($email: String!) {
    users(where: { email: { equals: $email } }) {
      id
      clerkId
      email
      name
    }
  }
`;

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $data: UserUpdateInput!) {
    updateUser(where: { id: $id }, data: $data) {
      id
      clerkId
      email
      name
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      clerkId
      email
      name
    }
  }
`;

async function syncUser(userData) {
  try {
    console.log('Starting user sync...');
    console.log('User data to sync:', userData);

    // Validate input
    if (!userData || !userData.clerkId || !userData.email) {
      throw new Error('Invalid user data: clerkId and email are required');
    }
    
    // 1. Check if user exists by clerkId
    const checkByClerkIdResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CHECK_USER_BY_CLERK_ID,
        variables: { 
          clerkId: userData.clerkId
        },
      }),
    });

    const clerkIdResult = await checkByClerkIdResponse.json();
    console.log('Check by clerkId response:', clerkIdResult);

    if (clerkIdResult.errors) {
      console.error('GraphQL error when checking by clerkId:', clerkIdResult.errors);
      throw new Error(clerkIdResult.errors[0].message);
    }

    // 2. If user exists by clerkId, return them
    if (clerkIdResult.data.users && clerkIdResult.data.users.length > 0) {
      console.log('User found by clerkId:', clerkIdResult.data.users[0]);
      return clerkIdResult.data.users[0];
    }

    // 3. Check if user exists by email (may exist without clerkId)
    const checkByEmailResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CHECK_USER_BY_EMAIL,
        variables: { 
          email: userData.email
        },
      }),
    });

    const emailResult = await checkByEmailResponse.json();
    console.log('Check by email response:', emailResult);

    if (emailResult.errors) {
      console.error('GraphQL error when checking by email:', emailResult.errors);
      throw new Error(emailResult.errors[0].message);
    }

    // 4. If user exists by email, update with clerkId
    if (emailResult.data.users && emailResult.data.users.length > 0) {
      const existingUser = emailResult.data.users[0];
      console.log('User found by email, updating with clerkId...');
      
      const updateResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: UPDATE_USER_MUTATION,
          variables: {
            id: existingUser.id,
            data: {
              clerkId: userData.clerkId,
              name: userData.name || existingUser.name,
            },
          },
        }),
      });

      const updateResult = await updateResponse.json();
      console.log('Update user response:', updateResult);
      
      if (updateResult.errors) {
        console.error('Update user errors:', updateResult.errors);
        throw new Error(updateResult.errors[0].message);
      }

      console.log('User updated successfully:', updateResult.data.updateUser);
      return updateResult.data.updateUser;
    }

    // 5. User doesn't exist at all, create new user
    console.log('User not found, creating new user...');
    
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CREATE_USER_MUTATION,
        variables: {
          data: {
            clerkId: userData.clerkId,
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            // Note: Adjust these fields based on your Keystone schema
            password: 'clerk-managed', // Dummy password since Clerk handles auth
            isAdmin: false,
          },
        },
      }),
    });

    const createResult = await createResponse.json();
    console.log('Create user response:', createResult);
    
    if (createResult.errors) {
      console.error('Create user errors:', createResult.errors);
      throw new Error(createResult.errors[0].message);
    }

    console.log('User created successfully:', createResult.data.createUser);
    return createResult.data.createUser;
    
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
}

export default syncUser;