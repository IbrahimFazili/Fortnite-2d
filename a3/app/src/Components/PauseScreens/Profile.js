import TransparentInput from '../TransparentInput/TransparentInput';
import TransparentButton from '../TransparentButton/TransparentButton';

const Profile = () => {

    return (
        <div id="profile">
            <h2 id="overlay-text" style={{ alignSelf: 'center', color: 'white' }}>Profile</h2>
                <TransparentInput
                    label='Username'
                    type='text'
                    color='white'
                    labelStyle={{ alignSelf: 'center', color: 'white' }}
                />

            <br />

            <TransparentInput
                label='Email'
                type='email'
                color='white'
                labelStyle={{ alignSelf: 'center', color: 'white' }}
            />
            <br />
            <div id="profileRow">
                <label for="genderInput">Gender</label><br /><br />
                <div style={{ display: 'flex', justifyContent: 'space-evenly', }}>
                    <label for="maleUpdate">Male</label>
                    <input id="maleUpdate" class="input" type="radio" name="genderInput" autocomplete="off" required
                        value="M"
                        autofocus />
                    <label for="femaleUpdate">Female</label>
                    <input id="femaleUpdate" class="input" type="radio" name="genderInput" autocomplete="off" required
                        value="F"
                        autofocus />
                    <label for="otherUpdate">Other</label>
                    <input id="otherUpdate" class="input" type="radio" name="genderInput" autocomplete="off" required
                        value="O"
                        autofocus />
                </div>
            </div>

            <br /><br /><br />
            <TransparentButton
                color='#c2b5b5'
                hoverColor='#261D20'
                type='button'
                value='Update'
                onClick={() => console.log('clicked Update')}
            />
            <br />
            <TransparentButton
                color='#c2b5b5'
                hoverColor='#261D20'
                type='button'
                value='Delete'
                onClick={() => console.log('clicked Delete')}
            />
            <br />
            <div id="profile-err"></div>

        </div>
    );
}

export default Profile;