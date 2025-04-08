import { FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS } from "../action/userAction"

const INITIAL_STATE = {
    account: {
        access_token: '',
        refresh_token: '',
        username: '',
        email: '',
        image: '',
        role: ''
    },
    isAuthenticated: false
}
const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
            const data = action?.payload?.DT
            return {
                ...state,
                account: {
                    access_token: data?.access_token,
                    refresh_token: data?.refresh_token,
                    username: data?.username,
                    email: data?.email,
                    image: data?.image,
                    role: data?.role
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
                    role: ''
                },
                isAuthenticated: false
            }
        default:
            return state
    }
}

export default userReducer