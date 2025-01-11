import json
from google.cloud import aiplatform_v1
from vertexai.language_models import TextEmbeddingModel
from vertexai.preview.generative_models import GenerativeModel

API_ENDPOINT = "983077304.europe-west4-473959329962.vdb.vertexai.goog"
INDEX_ENDPOINT = (
    "projects/473959329962/locations/europe-west4/indexEndpoints/7592541206165323776"
)
DEPLOYED_INDEX_ID = "qa_mo3amalat_1736265940277"

# This is in the parent folder because the backend is run using npm run backend from parent folder
with open("public/qa.json", "r", encoding="utf-8") as f:
    qa_data = json.load(f)
qa_dict = {str(qa["id"]): qa for qa in qa_data}


def generate_embedding(text):
    model = TextEmbeddingModel.from_pretrained("text-multilingual-embedding-002")
    embedding = model.get_embeddings([text])[0].values
    return embedding


client_options = {"api_endpoint": API_ENDPOINT}
vector_search_client = aiplatform_v1.MatchServiceClient(client_options=client_options)


def query_matching_engine(embedding, num_neighbors=3):
    datapoint = aiplatform_v1.IndexDatapoint(feature_vector=embedding)
    query = aiplatform_v1.FindNeighborsRequest.Query(
        datapoint=datapoint,
        neighbor_count=5,
    )
    request = aiplatform_v1.FindNeighborsRequest(
        index_endpoint=INDEX_ENDPOINT,
        deployed_index_id=DEPLOYED_INDEX_ID,
        queries=[query],
        return_full_datapoint=False,
    )
    response = vector_search_client.find_neighbors(request)
    return [
        obj.datapoint.datapoint_id for obj in response.nearest_neighbors[0].neighbors
    ]


def construct_prompt(user_question, similar_questions_ids):
    context = ""
    for id in similar_questions_ids:
        qa = qa_dict.get(id)
        if qa:
            context += (
                f"- ({qa['id']})سؤال: {qa['question']}\n  الإجابة: {qa['answer']}\n"
            )
    # print(context)
    return f"""
      User Question: {user_question}
      
      Context:
      {context}
    """


def query_llm(prompt):
    gemini_model = GenerativeModel(
        "gemini-1.5-pro-001",
        system_instruction="""
          Please try to answer the user question in its language, only if you can 
          infer the answer from the context below the question. Provide the user with the answer first, then an explanation, 
          then an exact copy of the question and answer you used from context to find the answer.
          If you can't infer the answer just respond with "Sorry, I can't find the answer. Email us @" translated to the prompt's language
        """,
    )
    print(prompt)
    response = gemini_model.generate_content(prompt)
    return response.text


def answer_question(user_question):
    user_embedding = generate_embedding(user_question)
    similar_questions_ids = query_matching_engine(user_embedding)
    prompt = construct_prompt(user_question, similar_questions_ids)
    llm_answer = query_llm(prompt)
    return llm_answer
