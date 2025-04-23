import { FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS } from "../action/userAction"

const INITIAL_STATE = {
    account: {
        access_token: '',
        refresh_token: '',
        username: '',
        email: '',
        image: '',
        phone_number: '',
        role: []
    },
    isAuthenticated: false
}

const userReducer = (state = INITIAL_STATE, action: any) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
            const data = action?.payload?.DT
            return {
                ...state,
                account: {
                    access_token: data?.access_token,
                    refresh_token: data?.refresh_token,
                    phone_number: data?.phone_number,
                    username: data?.username,
                    email: data?.email,
                    image: data?.image,
                    role: Array.isArray(data?.role) ? data?.role : [data?.role]
                },
                isAuthenticated: true
            }
        case USER_LOGOUT_SUCCESS:
            return {
                ...state,
                account: {
                    access_token: '',
                    refresh_token: '',
                    username: '',
                    email: '',
                    image: '',
                    phone_number: '',
                    role: []
                },
                isAuthenticated: false
            }
        default:
            return state
    }
}

export default userReducer
