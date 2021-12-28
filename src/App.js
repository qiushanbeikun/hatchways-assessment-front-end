import './App.css';
import axios from "axios";
import {useEffect, useState} from "react";
import './App.css';
import {Container, Grid, TextField} from "@mui/material";


function App() {
    // list is the list to be displayed
    const [list, setList] = useState([]);
    // full list preserve all values, only being updated when tag changes.
    const [fullList, setFullList] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchTag, setSearchTag] = useState('');


    const handleNameSearchChange = (event) => {
        event.preventDefault();
        let name = event.target.value.trim();
        setSearchName(name);
        updateCards(name, searchTag);
    }

    const handleTagSearchChange = ((event) => {
        event.preventDefault();
        let tag = event.target.value.trim();
        setSearchTag(tag);
        updateCards(searchName, tag);
    })

    const handleChildTagUpdate = ((event, id, tags) => {
        event.preventDefault();
        let original = list.find((each) => each.id === id)
        let index = list.indexOf(original);
        original.tags = tags;
        // update list and fullList
        list[index] = original
        fullList[index] = original
        setList(list)
        setFullList(fullList)
    })

    const updateCards = (name, tag) => {
        // at least one of name, tag is not empty
        let result = fullList;
        // filter first name and last name
        if (name !== "") {
            result = result.filter((each) => {
                return each.firstName.toLowerCase().includes(name.toLowerCase()) || each.lastName.toLowerCase().includes(name.toLowerCase());
            })
        }
        // filter through tags
        if (tag !== "") {
            result = result.filter((each) => {
                return !!each.tags && each.tags.reduce((acc, cur) => acc || cur.includes(tag), false)
            })
        }
        setList(result);
    }

    useEffect(() => {
        axios.get("https://api.hatchways.io/assessment/students").then((response) => {
            let students = response.data.students;
            setList(students);
            setFullList(students);
        })
    }, [])

    return (
        <Container maxWidth="md">
            <div className="main_card">
                <div className="search_fields">
                    <TextField fullWidth id="name_search_field" label="Search by name" variant="standard"
                               value={searchName} onChange={handleNameSearchChange} className="card_content"/>
                    <TextField fullWidth id="tag_search_field" label="Search by tag" variant="standard"
                               value={searchTag} onChange={handleTagSearchChange} className="card_content"/>
                </div>
                {list.map(each => <InfoCard student={each} onUpdate={handleChildTagUpdate}/>)}
            </div>
        </Container>
    );
}

function InfoCard(props) {
    const each = props.student;

    const [showGrades, setShowGrades] = useState(false);

    const [tags, setTags] = useState((!! each.tags && each.tags.length !== 0) ? each.tags : []);

    const [tagField, setTagField] = useState("");

    const handleTagFieldChange = ((event) => {
        event.preventDefault();
        setTagField(event.target.value);
    })

    const handleEnter = (event) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            const curTag = event.target.value;
            if (!tags.includes(curTag)) {
                setTags([...tags, curTag]);
                setTagField("");
                props.onUpdate(event, each.id, [...tags, curTag])
            }
        }
    }

    /**
     * calculate student average from string grades list.
     * @param grades [string]
     * @returns {number}
     */
    const getAverageGrade = (grades) => {
        return grades.reduce((acc, cur) => {
            return acc + parseInt(cur);
        }, 0) / grades.length;
    }

    const handleExpand = ((event) => {
        event.preventDefault();
        setShowGrades(!showGrades);
    })

    return (
        <div className={"student_" + each.id}>
            <Grid container className="card_content">
                <Grid item xs={3}>
                    <img src={each.pic} className="profile_photo" alt={each.firstName}/>
                </Grid>
                <Grid item xs={9}>
                    <Grid container>
                        <Grid item xs={11}>
                            <p className="name_title">{each.firstName.toUpperCase()} {each.lastName.toUpperCase()}</p>
                        </Grid>
                        <Grid item xs={1}>
                            <button className="expand_button" onClick={handleExpand}>{(showGrades) ? "-" : "+"}</button>
                        </Grid>

                        <Grid item xs={12}>
                            <div>
                                <ul className="detailed_info">
                                    <li>Email: {each.email}</li>
                                    <li>Company: {each.company}</li>
                                    <li>Skill: {each.skill}</li>
                                    <li>Average: {getAverageGrade(each.grades)}%</li>

                                    {(showGrades) && (
                                        <div className="detailed_grades">
                                            {each.grades.map((grade, index) =>
                                                <li>Test {index+1}: &nbsp;&nbsp;&nbsp;&nbsp;{grade}%</li>)}
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </Grid>

                        <Grid item xs={12}>
                            {(!!each.tags && each.tags.length !== 0) && (
                                <div className="tags_field">
                                    {each.tags.map((tag) => <span className="tag">{tag}</span>)}
                                </div>
                            )}
                            <div className="tags_input">
                                <TextField label="Add a tag" variant="standard" value={tagField}
                                           onChange={handleTagFieldChange} onKeyUp={handleEnter}/>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

export default App;
