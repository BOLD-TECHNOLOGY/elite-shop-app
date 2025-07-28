import { useContext } from 'react';
import { AppContext } from '../Context/AppContext';
import { apiRequest } from '../api/Api';

export default function useApi() {
    const { user } = useContext(AppContext);

    const request = (method, endpoint, data = null) => {
        return apiRequest(method, user.role, endpoint, data);
    };

    return { request };
}
