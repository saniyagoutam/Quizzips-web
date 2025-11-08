// redux/examReducer.js
const initialState = {
  currentExam: null,
  answers: [],
  trace: 0
};

const examReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_EXAM':
      return {
        ...state,
        currentExam: action.payload,
        answers: new Array(action.payload.questions.length).fill(null),
        trace: 0
      };
    case 'SET_ANSWER':
      const newAnswers = [...state.answers];
      newAnswers[action.payload.index] = action.payload.answer;
      return {
        ...state,
        answers: newAnswers
      };
    case 'SET_TRACE':
      return {
        ...state,
        trace: action.payload
      };
    case 'RESET_EXAM':
      return initialState;
    default:
      return state;
  }
};

export default examReducer;
