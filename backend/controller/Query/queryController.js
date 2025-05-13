import { Answer } from "../../model/Query/answerModel.js";
import { Comment } from "../../model/Query/commentModel.js";
import { Question } from "../../model/Query/questionModel.js";
import AnalyticsInfo from "../../model/User/analyticsInfo.js"
import User from "../../model/User/userInfo.js";

const showAllQuery= async (req, res)=> {
	try {
        const response= await Question.find({}).populate("askedBy", "fullName rollNumber");
        
        if(response.length==0){
            res.status(200).json({
                message: "There is no query"
            })
        }

        res.status(200).json(response);
           
    } catch (error) {
        res.status(500).json({
            message: "Error in ShowAllQuery",
            error: error.message
        });
    }
}

const postQuestion= async (req, res)=>{
    
    try {
       
        const {title, content, category}= req.body;

        if(!title || !content){
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        const checkTitle= title.trim();
        const existingTitle= await Question.findOne({title: checkTitle});
        
        if(existingTitle){
            return res.status(400).json({message: "Title already Exist"});
        }

        //check for similar question
        // const similarQuestion= await Question.find(
        //     { $text: {$search: title}},        //search for similar title and content
        //     {score: {$meta: "textScore"}}      //get match score
        // ).sort({score: {$meta: "textScore"}}).limit(3);  //to get top 3

        // if(similarQuestion.length>0){
        //     return res.status(409).json({ 
        //         message: "A similar question already exist",
        //         similarQuestion
        //     })
        // }

        const newQuestion= new Question({
            askedBy: req.user._id,
            title,
            content, 
            category
        })

        await newQuestion.save();

        res.status(200).json({
            message: "Question Submitted Succesfully"
        })

    } catch (error) {
        res.status(500).json({
            message: "Error in postQuestion",
            error: error.message
        });
    }
}

const upvotes= async (req, res)=>{
    try {
        const{questionId}= req.params;
        const userId= req.user._id;
    
        const question= await Question.findById(questionId);
    
        if(!question){
            return res.status(401).json({message: "Question Not Found"});
        }
    
        // remove from downvote from question if there
        question.downvotes= question.downvotes.filter(id=> id.toString() !== userId.toString());
    
        //check if already upvoted
        const alreadyVoted= question.upvotes.includes(userId);
    
        if(alreadyVoted){
            question.upvotes= question.upvotes.filter(id=> id.toString()!== userId.toString())
        } else{
            question.upvotes.push(userId);
        }
    
        await question.save();
    
        res.status(200).json({
            message: "Upvote updated Successfully",
            upvotes: question.upvotes.length,
            downvotes: question.downvotes.length
        })
    } catch (error) {
        res.status(500).json({
            message: "Error in upvotes of Question",
            error: error.message
        })
    }
}

const downvotes= async (req, res)=>{
    try {
        const {questionId}= req.params;
        const userId= req.user._id;

        const question= await Question.findById(questionId);

        if(!question){
           return res.status(409).json({
                message: "Question Not Found",
            })
        }

        //remove from upvote
        question.upvotes= question.upvotes.filter( id=> id.toString() !== userId.toString());

        //if already voted then remove
        const alreadyDownvotes= question.downvotes.includes(userId);

        if(alreadyDownvotes){
            question.downvotes= question.downvotes.filter(id=> id.toString() !== userId.toString());
        } else{
            question.downvotes.push(userId)
        }

        await question.save();
        res.status(200).json({
            message: "Downvote updated Successfully",
            upvotes: question.upvotes.length,
            downvotes: question.downvotes.length
        })
    } catch (error) {
        res.status(500).json({
            message: "Error in downvotes of Question",
            error: error.message
        })
    }
}

const showAllAnswer= async (req, res)=>{
    try {
        const userId= req.user._id
        // console.log(userId);
        
        const {questionId}= req.params;

        const question= await Question.findById(questionId)
        .populate("askedBy", "fullName rollNumber")
        .populate({
            path: "answers",
            populate:[ 
                {path: "answeredBy", select: "fullName rollNumber"},
                {path: "comments",
                    populate: {path: "commentedBy", select: "fullName rollNumber"}
                }
            ],
        }).lean()

        if(!question){
            return res.status(404).json({ message: "Question not found" });
        }

        // console.log(question);
//         Mongoose documents are not plain JavaScript objects. use .lean() to convert in plain
//          They have special properties and behaviors that prevent direct modification.
        question.userId= userId;
        question.answers.sort((a,b)=>{
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
        // console.log(question);
        
        // question.answers.comments?.sort((a,b)=>{
        //     return new Date(b.createdAt) - new Date(a.createdAt)
        // })

        question.answers.map((A)=>(
            A.comments.sort((a,b)=>{
                return new Date(b.createdAt) - new Date(a.createdAt)
            })
        )
        )
    
        res.status(200).json(question);

    } catch (error) {
        res.status(500).json({
            message: "Error in showALLAnswer",
            error: error.message
        })
    }

}

const postAnswer= async (req, res)=>{
    try {
        const {questionId}= req.params;
        const userId= req.user._id;

        const question= await Question.findById(questionId);

        if(!question){
            return res.status(400).json({ message: "Question not found" });
        }

        const {answer}= req.body;
        // console.log(answer);
        

        // answer= answer.trim();

        if (!answer) {
            return res.status(400).json({ message: "Answer content is required" });
        }

        // const similarAnswer= await Answer.find(
        //     {$text: {$search: answer}},
        //     {score: {$meta: "textScore"}}
        // ).sort({score: {$meta: "textScore"}}).limit(3);

        // if(similarAnswer.length>0){
        //     return res.status(400).json({
        //         message: "Similar Answer already Exist",
        //         similarAnswer
        //     })
        // }

        const newAnswer= new Answer({
            answeredBy: userId,
            questionId,
            answer
        })

        const createdAnswer= await newAnswer.save();

        

        if(!createdAnswer){
           return res.status(500).json({message: "could not create answer"})
        }

        question.answers.push(createdAnswer._id);
        await question.save();
        await newAnswer.save();

        const user= await User.findById(userId);

        const analytics= await AnalyticsInfo.findOneAndUpdate(
            {userId: userId},
            {$inc: {QueryAnswered: 1}},
            {  new: true, 
                upsert: true, 
                setDefaultsOnInsert: true });
        

        if(!user.analyticsId){
            user.analyticsId= analytics._id;
            await user.save();
        }

        res.status(200).json({newAnswer})

    } catch (error) {
        res.status(500).json({
            message: "Error in postAnswer",
            error: error.message
        })

        // res.end(erro)
    }

}

const postComment= async (req, res)=>{
    // const {questionId}= req.params;
    try {
        const {answerId}= req.params;
        const userId= req.user._id;

        const answer= await Answer.findById(answerId);

        if(!answer){
            return res.status(400).json({
                message: "AnswerId Not Found"
            })
        }
    
        const {content}= req.body;
    
        if(!content.trim()){
            return res.status(400).json({
                message: "Comment Cannot be empty"
            })
        }
    
        const response= await Comment.create({
            answerId,
            commentedBy: userId,
            content: content.trim()
        })
    
        if(!response){
            res.status(500).json({
                message: "Cannot create comment",
                error: error.message
            })
        }
        
        answer.comments.push(response._id);
        await answer.save()
    
        res.status(200).json({
            message: "Commented Successfully",
            response,
        })
    } catch (error) {
        res.status(500).json({
            message: "Error in postComment",
            error: error.message
        })
    }




}

const answerUpvote= async (req, res)=>{
    try {
        const userId= req.user._id;
        const {answerId}= req.params;

        const answer= await Answer.findById(answerId);

        if(!answer){
            return res.status(400).json({
                message: "Could not find Answer",
            })
        }

        // const disliked= answer.downvotes.includes(userId);
        // if(disliked){
        //     answer.downvotes= answer.downvotes.filter((id)=> id.toString()!=userId.toString())
        // }

        answer.downvotes= answer.downvotes.filter((id)=> id.toString()!=userId.toString())

        const alreadyUpvoted= answer.upvotes.includes(userId);

        if(alreadyUpvoted){
            answer.upvotes= answer.upvotes.filter((id)=> id.toString() !== userId.toString())
        } else answer.upvotes.push(userId);

        await answer.save();

        res.status(200).json({
            message: "Upvote updated Successfully",
            upvotes: answer.upvotes.length,
            downvotes: answer.downvotes.length
        })


    } catch (error) {
        res.status(500).json({
            message: "Error in upvotes of Answer",
            error: error.message
        })
    }

}

const answerDownvote= async (req, res)=>{
    try {
        const userId= req.user._id;
        const {answerId}= req.params;

        const answer= await Answer.findById(answerId);

        if(!answer){
            return res.status(400).json({
                message: "Could not find Answer",
            })
        }


        answer.upvotes= answer.upvotes.filter((id)=> id.toString()!==userId.toString())

        const alreadyDownvoted= answer.downvotes.includes(userId);

        if(alreadyDownvoted){
            answer.downvotes= answer.downvotes.filter((id)=> id.toString() !== userId.toString())
        } else answer.downvotes.push(userId);

        await answer.save();

        res.status(200).json({
            message: "Downvote updated Successfully",
            upvotes: answer.upvotes.length,
            downvotes: answer.downvotes.length
        })

    } catch (error) {
        res.status(500).json({
            message: "Error in downvotes of Answer",
            error: error.message
        })
    }
}

export {showAllQuery, postQuestion, upvotes, downvotes, showAllAnswer, postComment, postAnswer, answerDownvote, answerUpvote};