import React, { useContext, useState, useEffect } from "react";

// import {  Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";

import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from '@material-ui/icons/Send';
import MessageIcon from '@material-ui/icons/Message';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';

import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import TabPanel from "../../components/TabPanel"
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import useAuth from "../../hooks/useAuth.js";
import { ChatsUser } from "./ChartsUser";
import ChartDonut from "./ChartDonut";

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";

import {
    Dialog,
    DialogContent,
    Avatar,
    Grid,
    Button,
    Paper,
    Typography,
    Card,
    Tab,
    Tabs,
    SvgIcon,
    CardContent,
    Container
} from "@material-ui/core";

import { Score } from "@material-ui/icons";
import { number } from "yup";
import { i18n } from "../../translate/i18n";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";

const useStyles = makeStyles((theme) => ({
    overline: {
        fontSize: '0.9rem',
        fontWeight: 700,
        color: "grey",
        letterSpacing: '0.5px',
        lineHeight: 2.5,
        textTransform: 'uppercase',
        fontFamily: "'Plus Jakarta Sans', sans-serif'",
    },
    h4: {
        fontFamily: "'Plus Jakarta Sans', sans-serif'",
        fontWeight: 500,
        fontSize: '2rem',
        lineHeight: 1,
        color: "grey",
    },
    tab: {
        minWidth: "auto",
        width: "auto",
        padding: theme.spacing(0.5, 1),
        borderRadius: 8,
        transition: "0.3s",
        borderWidth: "1px",
        borderStyle: "solid",
        marginRight: theme.spacing(0.5),
        marginLeft: theme.spacing(0.5),

        [theme.breakpoints.down("lg")]: {
            fontSize: "0.9rem",
            padding: theme.spacing(0.4, 0.8),
            marginRight: theme.spacing(0.4),
            marginLeft: theme.spacing(0.4),
        },
        [theme.breakpoints.down("md")]: {
            fontSize: "0.8rem",
            padding: theme.spacing(0.3, 0.6),
            marginRight: theme.spacing(0.3),
            marginLeft: theme.spacing(0.3),
        },
        "&:hover": {
            backgroundColor: "rgba(6, 81, 131, 0.3)",
        },
        "&$selected": {
            color: "#FFF",
            backgroundColor: theme.palette.primary.main,
        },
    },
    tabIndicator: {
        borderWidth: "2px",
        borderStyle: "solid",
        height: 6,
        bottom: 0,
        color: theme.mode === "light" ? "#065183" : "#FFF",
    },
    container: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.padding,
        maxWidth: "1150px",
        minWidth: "xs",
    },
    nps: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.padding,
    },
    fixedHeightPaper: {
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        height: 240,
        overflowY: "auto",
        ...theme.scrollbarStyles,
    },
    cardAvatar: {
        fontSize: "55px",
        color: grey[500],
        backgroundColor: "#ffffff",
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
    cardTitle: {
        fontSize: "18px",
        color: blue[700],
    },
    cardSubtitle: {
        color: grey[600],
        fontSize: "14px",
    },
    alignRight: {
        textAlign: "right",
    },
    fullWidth: {
        width: "100%",
    },
    selectContainer: {
        width: "100%",
        textAlign: "left",
    },
    iframeDashboard: {
        width: "100%",
        height: "calc(100vh - 64px)",
        border: "none",
    },

    customFixedHeightPaper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: 120,
    },
    customFixedHeightPaperLg: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
        height: "100%",
    },
    fixedHeightPaper2: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
    },
}));

const Dashboard = () => {
    const theme = useTheme();
    const classes = useStyles();
    const [counters, setCounters] = useState({});
    const [attendants, setAttendants] = useState([]);
    const [filterType, setFilterType] = useState(1);
    const [period, setPeriod] = useState(0);
    const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
    const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
    const [loading, setLoading] = useState(false);
    const { find } = useDashboard();


    const { getCurrentUserInfo } = useAuth();

    //FILTROS NPS
    const [tab, setTab] = useState("Indicadores");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedQueues, setSelectedQueues] = useState([]);

    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    let nowIni = `${year}-${month < 10 ? `0${month}` : `${month}`}-01`;

    let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

    const [showFilter, setShowFilter] = useState(false);
    const [dateStartTicket, setDateStartTicket] = useState(nowIni);
    const [dateEndTicket, setDateEndTicket] = useState(now);
    const [queueTicket, setQueueTicket] = useState(false);
    const [fetchDataFilter, setFetchDataFilter] = useState(false);
    const [currentUser, setCurrentUser] = useState({});

    const { user } = useContext(AuthContext);
    var userQueueIds = [];

    if (user.queues && user.queues.length > 0) {
        userQueueIds = user.queues.map((q) => q.id);
    }

    useEffect(() => {
        getCurrentUserInfo().then(
            (user) => {
                setCurrentUser(user);
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        async function firstLoad() {
            await fetchData();
        }
        setTimeout(() => {
            firstLoad();
        }, 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchData() {
        setLoading(true);

        let params = {};

        if (period > 0) {
            params = {
                days: period,
            };
        }

        if (!isEmpty(dateStartTicket) && moment(dateStartTicket).isValid()) {
            params = {
                ...params,
                date_from: moment(dateStartTicket).format("YYYY-MM-DD"),
            };
        }

        if (!isEmpty(dateEndTicket) && moment(dateEndTicket).isValid()) {
            params = {
                ...params,
                date_to: moment(dateEndTicket).format("YYYY-MM-DD"),
            };
        }

        if (Object.keys(params).length === 0) {
            toast.error("Parametrize o filtro");
            setLoading(false);
            return;
        }

        const data = await find(params);

        if (!data) {
            setLoading(false);
            return;
        }

        setCounters(data.counters);
        if (isArray(data.attendants)) {
            setAttendants(data.attendants);
        } else {
            setAttendants([]);
        }

        setLoading(false);
    }

    const handleSelectedUsers = (selecteds) => {
        const users = selecteds.map((t) => t.id);
        setSelectedUsers(users);
    };


    const handleChangeTab = (e, newValue) => {
        setTab(newValue);
    };

    function formatTime(minutes) {
        return moment()
            .startOf("day")
            .add(minutes, "minutes")
            .format("HH[h] mm[m]");
    }

    const GetUsers = () => {
        let count;
        let userOnline = 0;
        attendants.forEach(user => {
            if (user.online === true) {
                userOnline = userOnline + 1
            }
        })
        count = userOnline === 0 ? 0 : userOnline;
        return count;
    };

    const GetContacts = (all) => {
        let props = {};
        if (all) {
            props = {};
        } else {
            props = {
                dateStart: dateStartTicket,
                dateEnd: dateEndTicket,
            };
        }
        const { count } = useContacts(props);
        return count;
    };

    const GetMessages = (all, fromMe) => {
        let props = {};
        if (all) {
            if (fromMe) {
                props = {
                    fromMe: true
                };
            } else {
                props = {
                    fromMe: false
                };
            }
        } else {
            if (fromMe) {
                props = {
                    fromMe: true,
                    dateStart: dateStartTicket,
                    dateEnd: dateEndTicket,
                };
            } else {
                props = {
                    fromMe: false,
                    dateStart: dateStartTicket,
                    dateEnd: dateEndTicket,
                };
            }
        }
        const { count } = useMessages(props);
        return count;
    };

    function toggleShowFilter() {
        setShowFilter(!showFilter);
    }

    return (
        <div>
            <Container maxWidth="lg" className={classes.container + ' px-1 py-10'}>
                <Grid container spacing={3} className={classes.container}>


                    <Grid container width="100%" justifyContent="center" className={'px-6 py-1.5'}>

                        <Tabs
                            value={tab}
                            onChange={handleChangeTab}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                            aria-label="icon label tabs example"
                            classes={{ indicator: classes.tabIndicator }}
                            style={{
                                borderRadius: "5px",
                                borderColor: "#aaa",
                                borderWidth: "1px",
                                borderStyle: "solid",
                                fontFamily: '"Plus Jakarta Sans", sans-serif',
                            }}
                        >
                            <Tab className={'border-none'}
                                style={{ color: theme.mode === "light" ? "#065183" : "#FFF" }}
                                value="Indicadores"
                                label={i18n.t("dashboard.tabs.indicators")}
                            />
                            <Tab className={'border-none'}
                                style={{ color: theme.mode === "light" ? "#065183" : "#FFF" }}
                                value="NPS"
                                label={i18n.t("dashboard.tabs.assessments")}
                            />
                            <Tab className={'border-none'}
                                style={{ color: theme.mode === "light" ? "#065183" : "#FFF" }}
                                value="Atendentes"
                                label={i18n.t("dashboard.tabs.attendants")}
                            />
                        </Tabs>
                        <Button
                            onClick={toggleShowFilter}
                            color="primary"
                        >
                            {!showFilter ? (
                                <FilterListIcon />
                            ) : (
                                <ClearIcon />
                            )}
                        </Button>
                        {showFilter && (
                            <Filters
                                classes={classes}
                                setDateStartTicket={setDateStartTicket}
                                setDateEndTicket={setDateEndTicket}
                                dateStartTicket={dateStartTicket}
                                dateEndTicket={dateEndTicket}
                                setQueueTicket={setQueueTicket}
                                queueTicket={queueTicket}
                                fetchData={setFetchDataFilter}
                            />
                        )}
                    </Grid>
                    <TabPanel
                        className={classes.container}
                        value={tab}
                        name={"Indicadores"}
                    >
                        <Container maxWidth="xl">
                            <Grid
                                container
                                spacing={3}
                            >
                                {/* EM ATENDIMENTO */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.inAttendance")}
                                                    </Typography>
                                                    <Typography variant="h4" className={classes.h4}>
                                                        {counters.supportHappening}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#0b708c',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <CallIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* AGUARDANDO */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}
                                >
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.waiting")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {counters.supportPending}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#47606e',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <HourglassEmptyIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* FINALIZADOS */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.finalized")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {counters.supportFinished}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#5852ab',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <CheckCircleIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* ATENDENTES ATIVOS */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.activeAttendants")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {GetUsers()}/{attendants.length}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#805753',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <RecordVoiceOverIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* NOVOS CONTATOS */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.newContacts")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {GetContacts(true)}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#8c6b19',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <GroupAddIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* MINHAS MENSAGEM RECEBIDAS */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.totalReceivedMessages")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {GetMessages(false, false)}/{GetMessages(true, false)}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#333133',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <MessageIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* MINHAS MENSAGEM ENVIADAS */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.totalSentMessages")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {GetMessages(false, true)}/{GetMessages(true, true)}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#558a59',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <SendIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* T.M. DE ATENDIMENTO */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.averageServiceTime")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {formatTime(counters.avgSupportTime)}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#F79009',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <AccessAlarmIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* T.M. DE ESPERA */}
                                <Grid xs={12}
                                    sm={8}
                                    lg={4}
                                    className={'p-2'}>
                                    <Card sx={{
                                        height: "100%",
                                        backgroundColor:
                                            theme.mode === "light"
                                                ? "transparent"
                                                : "rgba(170, 170, 170, 0.2)",
                                    }}>
                                        <CardContent>
                                            <div className={'stack flex flex-row items-start space-between gap-3'}>
                                                <div className={'flex flex-col flex-grow gap-1'}>
                                                    <Typography
                                                        color="primary"
                                                        variant="overline"
                                                        className={classes.overline}
                                                    >
                                                        {i18n.t("dashboard.cards.averageWaitingTime")}
                                                    </Typography>
                                                    <Typography variant="h4"
                                                        className={classes.h4}
                                                    >
                                                        {formatTime(counters.avgWaitTime)}
                                                    </Typography>
                                                </div>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor: '#8a2c40',
                                                        height: 60,
                                                        width: 60
                                                    }}
                                                >
                                                    <SvgIcon>
                                                        <TimerIcon />
                                                    </SvgIcon>
                                                </Avatar>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Container>
                    </TabPanel>

                    <TabPanel
                        className={classes.container}
                        value={tab}
                        name={"NPS"}
                    >
                        <Container maxWidth="xl p-2">

                            <Grid className={classes.container}>
                                <Paper elevation={3}>

                                    <Grid container width="100%">

                                        <Grid xs={12} sm={6} md={3}>

                                            <ChartDonut
                                                data={[`{'name': 'Promotores', 'value': ${counters.npsPromotersPerc | 100}}`,
                                                `{'name': 'Detratores', 'value': ${counters.npsDetractorsPerc | 0}}`,
                                                `{'name': 'Neutros', 'value': ${counters.npsPassivePerc | 0}}`
                                                ]}
                                                value={counters.npsScore | 0}
                                                title="Score"
                                                color={(parseInt(counters.npsPromotersPerc | 0) + parseInt(counters.npsDetractorsPerc | 0) + parseInt(counters.npsPassivePerc | 0)) === 0 ? ["#918F94"] : ["#2EA85A", "#F73A2C", "#F7EC2C"]}
                                            />
                                        </Grid>

                                        <Grid xs={12} sm={6} md={3}>

                                            <ChartDonut
                                                title={i18n.t("dashboard.assessments.prosecutors")}
                                                value={counters.npsPromotersPerc | 0}
                                                data={[`{'name': 'Promotores', 'value': 100}`]}
                                                color={["#2EA85A"]}
                                            />

                                        </Grid>

                                        <Grid xs={12} sm={6} md={3}>

                                            <ChartDonut
                                                data={[`{'name': 'Neutros', 'value': 100}`]}
                                                title={i18n.t("dashboard.assessments.neutral")}
                                                value={counters.npsPassivePerc | 0}
                                                color={["#F7EC2C"]}
                                            />

                                        </Grid>

                                        <Grid xs={12} sm={6} md={3}>
                                            <ChartDonut
                                                data={[`{'name': 'Detratores', 'value': 100}`]}
                                                title={i18n.t("dashboard.assessments.detractors")}
                                                value={counters.npsDetractorsPerc | 0}
                                                color={["#F73A2C"]}
                                            />
                                        </Grid>

                                        <Grid xs={12} sm={6} md={12}
                                            className={'border-gray-400 border border-r-0 border-l-0 border-b-0'}>
                                            <div className={'p-4'}>
                                                <Typography
                                                    component="h3"
                                                    variant="h6"
                                                    paragraph
                                                    style={{ marginLeft: "10px" }}
                                                >
                                                    {i18n.t("dashboard.assessments.totalCalls")}: {counters.tickets}
                                                    <br></br>
                                                    {i18n.t("dashboard.assessments.callsWaitRating")}: {counters.waitRating}
                                                    <br></br>
                                                    {i18n.t("dashboard.assessments.callsWithoutRating")}: {counters.withoutRating}
                                                    <br></br>
                                                    {i18n.t("dashboard.assessments.ratedCalls")}: {counters.withRating}
                                                    <br></br>
                                                    {i18n.t("dashboard.assessments.evaluationIndex")}: {Number(counters.percRating / 100).toLocaleString(undefined, { style: 'percent' })}
                                                    <br></br>
                                                </Typography>
                                            </div>
                                        </Grid>

                                    </Grid>
                                </Paper>

                            </Grid>

                        </Container>
                    </TabPanel>

                    <TabPanel
                        className={classes.container}
                        value={tab}
                        name={"Atendentes"}
                    >

                        <Container maxWidth="xl p-2">
                            <Grid container width="100%">


                                {/* INFO DOS USUARIOS */}
                                <Grid item xs={12} className={'p-1'}>
                                    {attendants.length ? (
                                        <TableAttendantsStatus
                                            attendants={attendants}
                                            loading={loading}
                                        />
                                    ) : null}
                                </Grid>

                                {/* TOTAL DE ATENDIMENTOS POR USUARIO */}
                                <Grid xs={12} className={'p-1'}>
                                    <Paper className={classes.fixedHeightPaper2}>
                                        <ChatsUser />
                                    </Paper>
                                </Grid>

                                {/* TOTAL DE ATENDIMENTOS */}
                                <Grid xs={12} className={'p-1'}>
                                    <Paper className={classes.fixedHeightPaper2}>
                                        <ChartsDate />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Container>
                    </TabPanel>
                </Grid>
            </Container>
        </div>
    );
};

export default Dashboard;
