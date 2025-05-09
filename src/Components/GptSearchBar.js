import { chatSession } from "../Common/GeminiAiModel";
import React, { useRef } from 'react'
import lang from '../Common/LanguageConstant'
import { useDispatch, useSelector } from 'react-redux'
import { API_OPTIONS } from "../Common/constants";
import { addGptMovieResult } from "../Common/gptSlice";

const GptSearchBar = () => {
  const dispatch = useDispatch();

  const langKey = useSelector((store) => store.config.lang);
  const searchText = useRef(null);

  const serachMovieTMDB = async (movie) => {
    const data = await fetch
      ("https://api.themoviedb.org/3/search/movie?query=" +
        movie +
        "&include_adult=false&language=en-US&page=1",
        API_OPTIONS
      );
    const json = await data.json()

    return json.results;
  }

  const handleGptSearchClick = async () => {

    const gptQuery = `Act as a movie recommendation system and suggest some movies for the query: ${searchText.current.value}. 
      Only give me the names of 7 movies, comma-separated.`;

    const gptresult = await chatSession.sendMessage(gptQuery);

    //console.log(gptresult?.response?.candidates?.[0]?.content?.parts?.[0]?.text.split(","));

    if (!gptresult?.response?.candidates) {
      //error
    }
    const gptMovies = gptresult?.response?.candidates?.[0]?.content?.parts?.[0]?.text.split(",");

    const promiseArray = gptMovies.map(movie => serachMovieTMDB(movie));

    const tmdbResults = await Promise.all(promiseArray);

    //console.log(tmdbResults);
    dispatch(addGptMovieResult({ movieNames: gptMovies, movieResults: tmdbResults }));
  };


  return (
    <div className='pt-[35%] md:pt-[10%] flex justify-center'>

      <form
        className=' w-full md:w-1/2 bg-black grid grid-cols-12'
        onSubmit={(e) => e.preventDefault()}
      >

        <input
          ref={searchText}
          type="text"
          className='p-4 m-4 col-span-9'
          placeholder={lang[langKey].gptSearchPlaceholder}
        />

        <button
          className=' col-span-3 m-4 py-2 px-4 bg-red-700 text-white rounded-lg'
          onClick={handleGptSearchClick}
        >
          {lang[langKey].search}
        </button>
      </form>
    </div>
  )
}

export default GptSearchBar
