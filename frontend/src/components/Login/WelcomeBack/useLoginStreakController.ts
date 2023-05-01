import { useState, useEffect } from "react";
import useTownController from "../../../hooks/useTownController";

interface LoginStreaksProps { 
    duration: number, 
    userId: string 
}

export default function useLoginStreakController(props: LoginStreaksProps) {
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [loginStreak, setLoginStreak] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(0);
  const coveyTownController = useTownController();

  useEffect(() => {
    const fetchLoginStreakData = async () => {
        // Replace this with your actual API call
        const resp = coveyTownController.getLoginStreakStatus(props.userId);
        const response = await resp;
        if (!response.loggedInToday) {
            setWelcomeVisible(true);
            setLoginStreak(response.streak);
            setDailyBonus(response.currencyAwarded);
        }
    };
    fetchLoginStreakData();
    
  }, [coveyTownController, props.userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWelcomeVisible(false);
    }, props.duration);

    return () => clearTimeout(timer);
  }, [props.duration, welcomeVisible]);

  const handleCloseWelcome = () => {
    setWelcomeVisible(false);
  };

  return { welcomeVisible, loginStreak, dailyBonus, handleCloseWelcome };
};