import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

async function fetchInfo(setData) {
    try {
        const token = localStorage.getItem('auth');
        const res = await fetch('http://localhost:8000/api/auth/leaderboard', {
            method: 'GET',
            headers: { "Authorization": `Bearer ${token}` },
        });

        const resJson = await res.json();

        if (res.status !== 200) {
            console.log(res.info);
            setData([]);
        }
        else {
            setData(resJson);
        }

    } catch (error) {
        // show error
        setData([]);
    }
}


const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'transparent'
    },
}));

const parseLeaderboardData = (data, classes) => {
    let leaderboard = [];
    
    data && data.forEach(e => {
        leaderboard.push(
            <div>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        {e['username']}
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        {e['highscore']}
                    </Paper>
                </Grid>
            </div>
        )
    });

    return leaderboard;
}

const LeaderBoard = () => {
    const [leaderBoardData, setData] = useState(null);
    const classes = useStyles();
    useEffect(() => !leaderBoardData && fetchInfo(setData), []);

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={useStyles().paper}>LeaderBoard</Paper>
                </Grid>
                {parseLeaderboardData(leaderBoardData, classes)}
            </Grid>
        </div>
    );
}

export default LeaderBoard;