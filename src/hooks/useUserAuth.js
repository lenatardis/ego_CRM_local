import { useEffect, useState } from "react";
import { getAccessToken, getRefreshToken } from "../utils/authTokens";
import { getUserInfo } from "../api/authApi";

export const useUserAuth = () => {
    const [userData, setUserData] = useState(null);
    const [isUserDataFetching, setIsUserDataFetching] = useState(true);

    const fetchUserData = async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            setIsUserDataFetching(false);
            return;
        }
        try {
            const accessToken = getAccessToken();
            const userInfo = await getUserInfo(accessToken);
            setUserData(userInfo);
        } catch (e) {
            console.log(e);
        } finally {
            setIsUserDataFetching(false);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, [])

    return { userData, isUserDataFetching };
}